import { useState } from "react";
import { StockItem } from "../StockManagerApp";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface StockOutModalProps {
  items: StockItem[];
  onClose: () => void;
  onStockOut: (itemId: string, quantity: number, personName: string) => void;
}

export function StockOutModal({ items, onClose, onStockOut }: StockOutModalProps) {
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || "");
  const [quantity, setQuantity] = useState("");
  const [personName, setPersonName] = useState("");

  const selectedItem = items.find((item) => item.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemId && parseInt(quantity) > 0 && personName.trim()) {
      onStockOut(selectedItemId, parseInt(quantity), personName);
    }
  };

  if (items.length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Out</DialogTitle>
            <DialogDescription>No items available. Please add an item first.</DialogDescription>
          </DialogHeader>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release Stock</DialogTitle>
          <DialogDescription>Release stock to someone</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='select-item'>Select Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger id='select-item'>
                  <SelectValue placeholder='Select an item' />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Available: {item.currentStock} {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='quantity'>Quantity</Label>
              <Input
                id='quantity'
                type='number'
                min='1'
                max={selectedItem?.currentStock || 0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Max: ${selectedItem?.currentStock || 0} ${
                  selectedItem?.unit || "units"
                }`}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='person-name'>Released To</Label>
              <Input
                id='person-name'
                type='text'
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter person's name"
                required
              />
            </div>
          </div>
          <div className='flex gap-3 mt-6'>
            <Button type='submit' className='flex-1 bg-red-600 hover:bg-red-700'>
              Confirm Stock Out
            </Button>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
