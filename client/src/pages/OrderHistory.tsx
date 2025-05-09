import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, DownloadIcon, ChevronRight, Package, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
};

type Order = {
  id: number;
  userId: number;
  total: number;
  status: string;
  address: string;
  createdAt: string;
  items?: OrderItem[];
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "shipped":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const OrderHistory = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }
  
  // Fetch orders
  const { 
    data: orders, 
    isLoading, 
    isError 
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Fetch order details
  const { 
    data: orderDetails,
    isLoading: isDetailsLoading,
  } = useQuery<Order>({
    queryKey: [`/api/orders/${selectedOrder?.id}`],
    enabled: !!selectedOrder,
  });
  
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  const closeDetails = () => {
    setIsDetailsOpen(false);
  };
  
  return (
    <>
      <Helmet>
        <title>Order History | ShopEase</title>
        <meta name="description" content="View your order history and track your shipments. Easy returns and order management." />
        <meta property="og:title" content="Order History | ShopEase" />
        <meta property="og:description" content="View your order history and track your shipments. Easy returns and order management." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-primary/5 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-neutral-800">Order History</h1>
          <p className="text-neutral-600 mt-2">
            View and manage your orders
          </p>
        </div>
      </div>
      
      <div className="container-custom py-8">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                Failed to load orders
              </h2>
              <p className="text-neutral-600 mb-4">
                There was an error loading your order history. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2 bg-neutral-50">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id}
                      </CardTitle>
                      <CardDescription>
                        Placed on {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(order.status)} capitalize px-3 py-1`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center text-neutral-600">
                        <Package size={16} className="mr-2" />
                        <span>Shipped to: {order.address}</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <ShoppingBag size={16} className="mr-2" />
                        <span>Total: {formatPrice(order.total)}</span>
                      </div>
                    </div>
                    <div className="flex mt-4 sm:mt-0">
                      <Button onClick={() => handleViewDetails(order)} variant="outline" className="mr-2">
                        <Eye size={16} className="mr-2" />
                        Details
                      </Button>
                      <Button variant="outline">
                        <DownloadIcon size={16} className="mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-neutral-300 mb-4" />
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                No orders yet
              </h2>
              <p className="text-neutral-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button asChild>
                <a href="/products">Start Shopping</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={closeDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder ? format(new Date(selectedOrder.createdAt), "MMMM d, yyyy 'at' h:mm a") : ""}
            </DialogDescription>
          </DialogHeader>
          
          {isDetailsLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : orderDetails ? (
            <>
              <div className="flex justify-between items-center py-2">
                <h3 className="font-semibold">Order Status</h3>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(orderDetails.status)} capitalize px-3 py-1`}
                >
                  {orderDetails.status}
                </Badge>
              </div>
              
              <div className="border rounded-md">
                <div className="bg-neutral-50 p-3 border-b">
                  <h3 className="font-semibold">Items</h3>
                </div>
                <div className="p-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="flex items-center">
                            <div className="w-10 h-10 bg-neutral-100 rounded-md mr-3 overflow-hidden">
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name}
                                className="w-full h-full object-contain" 
                              />
                            </div>
                            {item.product.name}
                          </TableCell>
                          <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">{formatPrice(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="border rounded-md">
                  <div className="bg-neutral-50 p-3 border-b">
                    <h3 className="font-semibold">Shipping Address</h3>
                  </div>
                  <div className="p-3">
                    <p className="text-neutral-600">{orderDetails.address}</p>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="bg-neutral-50 p-3 border-b">
                    <h3 className="font-semibold">Order Summary</h3>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Subtotal</span>
                      <span>{formatPrice(orderDetails.total - 4.99)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Shipping</span>
                      <span>{formatPrice(4.99)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t mt-2 pt-2 font-bold">
                      <span>Total</span>
                      <span>{formatPrice(orderDetails.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline">
                  <DownloadIcon size={16} className="mr-2" />
                  Download Invoice
                </Button>
                <Button variant="outline">
                  Contact Support
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p>Unable to load order details. Please try again.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderHistory;
