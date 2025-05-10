import { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { storage, type IStorage } from "./storage";
import { isMongoDbConnected } from "./db-utils";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { registerUserSchema, loginUserSchema, insertCartItemSchema, insertOrderSchema } from "../shared/schema";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "very-secret-token-key";
const TOKEN_EXPIRES_IN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function registerRoutes(app: Express, customStorage?: IStorage): Promise<Server> {
  const dbStorage: IStorage = customStorage || storage;

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: isMongoDbConnected ? 'mongodb' : 'in-memory',
    });
  });

  // Create API router
  const apiRouter = Router();

  // Middleware to handle Zod validation errors
  const validateRequest = (schema: any) => {
    return (req: any, res: any, next: any) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        next(error);
      }
    };
  };

  // Simple token generation
  const generateToken = (userId: number, username: string) => {
    const randomPart = randomBytes(16).toString('hex');
    const timePart = Date.now().toString(16);
    return `${userId}-${username}-${randomPart}-${timePart}`;
  };

  // Verify token middleware
  const verifyToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Basic token validation
    const parts = token.split('-');
    if (parts.length < 4) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // In a real app, you would verify the token against stored tokens
    // or check expiration (the timePart could be used for expiration)
    const userId = parseInt(parts[0]);
    if (isNaN(userId)) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = userId;
    req.username = parts[1];
    next();
  };

  // Auth routes
  apiRouter.post("/auth/register", validateRequest(registerUserSchema), async (req, res) => {
    try {
      const { confirmPassword, ...userData } = req.body;

      // Check if user already exists
      const existingUser = await dbStorage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const existingEmail = await dbStorage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = await dbStorage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate simple token
      const token = generateToken(user.id, user.username);

      // Return user without password and token
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        user: userWithoutPassword,
        token,
        message: "Registration successful",
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  apiRouter.post("/auth/login", validateRequest(loginUserSchema), async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if user exists
      const user = await dbStorage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate simple token
      const token = generateToken(user.id, user.username);

      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
        message: "Login successful",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // Get current user (protected route)
  apiRouter.get("/users/me", verifyToken, async (req: any, res) => {
    try {
      const user = await dbStorage.getUser(req.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Categories routes
  apiRouter.get("/categories", async (req, res) => {
    try {
      const categories = await dbStorage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.get("/categories/:slug", async (req, res) => {
    try {
      const category = await dbStorage.getCategoryBySlug(req.params.slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Get category error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Products routes
  apiRouter.get("/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      let products;
      
      if (categoryId) {
        products = await dbStorage.getProductsByCategory(categoryId);
      } else {
        products = await dbStorage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.get("/products/:slug", async (req, res) => {
    try {
      const product = await dbStorage.getProductBySlug(req.params.slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get the category for the product
      const category = await dbStorage.getCategoryById(product.categoryId || 0);
      
      res.json({ ...product, category });
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Cart routes
  apiRouter.get("/cart", verifyToken, async (req: any, res) => {
    try {
      const cartItems = await dbStorage.getCartItems(req.userId);
      
      if (cartItems.length === 0) {
        return res.json({ items: [], total: 0 });
      }
      
      // Get product details for each cart item
      const productIds = cartItems.map(item => item.productId).filter((id): id is number => id !== null);
      const products = await dbStorage.getProductsByIds(productIds);
      
      // Create a map for easy product lookup
      const productsMap = new Map(products.map(product => [product.id, product]));
      
      // Enhance cart items with product details and calculate total
      const enhancedItems: Array<{
        id: number;
        quantity: number;
        product: {
          id: number;
          name: string;
          price: number;
          imageUrl: string;
          isOnSale: boolean | null;
          originalPrice: number;
        };
      }> = [];
      
      for (const item of cartItems) {
        if (item.productId === null) continue;
        
        const product = productsMap.get(item.productId);
        if (!product) continue;
        
        const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        
        enhancedItems.push({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: product.id,
            name: product.name,
            price,
            imageUrl: product.imageUrl,
            isOnSale: product.isOnSale || null,
            originalPrice: product.price,
          }
        });
      }
      
      // Calculate total
      const total = enhancedItems.reduce((sum, item) => 
        sum + (item.quantity * item.product.price), 0);
      
      res.json({ items: enhancedItems, total });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.post("/cart", verifyToken, validateRequest(insertCartItemSchema), async (req: any, res) => {
    try {
      const { productId, quantity } = req.body;
      
      // Check if product exists
      const product = await dbStorage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if already in cart
      const existingCartItem = await dbStorage.getCartItem(req.userId, productId);
      
      if (existingCartItem) {
        // Update quantity
        const updatedCartItem = await dbStorage.updateCartItem(
          existingCartItem.id,
          existingCartItem.quantity + quantity
        );
        return res.json(updatedCartItem);
      }
      
      // Add new item to cart
      const cartItem = await dbStorage.createCartItem({
        userId: req.userId,
        productId,
        quantity
      });
      
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.put("/cart/:id", verifyToken, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedCartItem = await dbStorage.updateCartItem(cartItemId, quantity);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedCartItem);
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.delete("/cart/:id", verifyToken, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const success = await dbStorage.deleteCartItem(cartItemId);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Cart item removed" });
    } catch (error) {
      console.error("Delete cart item error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.delete("/cart", verifyToken, async (req: any, res) => {
    try {
      await dbStorage.clearCart(req.userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Order routes
  apiRouter.get("/orders", verifyToken, async (req: any, res) => {
    try {
      const orders = await dbStorage.getOrders(req.userId);
      
      // Enhance orders with items
      const enhancedOrders = await Promise.all(orders.map(async order => {
        const items = await dbStorage.getOrderItems(order.id);
        return { ...order, items };
      }));
      
      res.json(enhancedOrders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.post("/orders", verifyToken, validateRequest(insertOrderSchema), async (req: any, res) => {
    try {
      const { address, total } = req.body;
      
      // Create order
      const order = await dbStorage.createOrder({
        userId: req.userId,
        total,
        status: "pending",
        address
      });
      
      // Get cart items
      const cartItems = await dbStorage.getCartItems(req.userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Get product details for each cart item
      const productIds = cartItems.map(item => item.productId).filter((id): id is number => id !== null);
      const products = await dbStorage.getProductsByIds(productIds);
      
      // Create a map for easy product lookup
      const productsMap = new Map(products.map(product => [product.id, product]));
      
      // Create order items
      for (const item of cartItems) {
        if (item.productId === null) continue;
        const product = productsMap.get(item.productId);
        if (!product) continue;
        
        const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        
        await dbStorage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price
        });
      }
      
      // Clear cart
      await dbStorage.clearCart(req.userId);
      
      res.status(201).json({ 
        order,
        message: "Order created successfully" 
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.get("/orders/:id", verifyToken, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await dbStorage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user owns the order
      if (order.userId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Get order items
      const items = await dbStorage.getOrderItems(orderId);
      
      // Get products for each order item
      const productIds = items.map(item => item.productId).filter((id): id is number => id !== null);
      const products = await dbStorage.getProductsByIds(productIds);
      
      // Create a map for easy product lookup
      const productsMap = new Map(products.map(product => [product.id, product]));
      
      // Define enhanced item type
      type EnhancedOrderItem = {
        id: number;
        orderId: number;
        productId: number;
        quantity: number;
        price: number;
        product: {
          id: number;
          name: string;
          imageUrl: string;
        } | null;
      };
      
      // Enhance order items with product details
      const enhancedItems = items.map(item => {
        const product = item.productId !== null ? productsMap.get(item.productId) : undefined;
        return {
          ...item,
          product: product ? {
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl
          } : null
        } as EnhancedOrderItem;
      });
      
      res.json({ ...order, items: enhancedItems });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Mount API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}