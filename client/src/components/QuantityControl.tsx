import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onChangeQuantity?: (quantity: number) => void;
}

const QuantityControl = ({ 
  quantity,
  onIncrease,
  onDecrease,
  onChangeQuantity
}: QuantityControlProps) => {
  const [value, setValue] = useState(quantity.toString());

  useEffect(() => {
    setValue(quantity.toString());
  }, [quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^\d*$/.test(newValue)) {
      setValue(newValue);
    }
  };

  const handleBlur = () => {
    let newQuantity = parseInt(value);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    
    setValue(newQuantity.toString());
    
    if (onChangeQuantity && newQuantity !== quantity) {
      onChangeQuantity(newQuantity);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-6 w-6 rounded-l-md rounded-r-none"
        onClick={onDecrease}
        disabled={quantity <= 1}
      >
        <Minus size={14} />
      </Button>
      <Input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-6 w-12 rounded-none border-x-0 text-center p-0"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-6 w-6 rounded-r-md rounded-l-none"
        onClick={onIncrease}
      >
        <Plus size={14} />
      </Button>
    </div>
  );
};

export default QuantityControl;
