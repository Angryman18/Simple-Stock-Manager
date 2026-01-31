import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AddStockModalProps {
  onClose: () => void;
  onAdd: (name: string, initialStock: number, unit: string) => void;
}

export function AddStockModal({ onClose, onAdd }: AddStockModalProps) {
  const [name, setName] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [unit, setUnit] = useState("units");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && parseInt(initialStock) >= 0) {
      onAdd(name.trim(), parseInt(initialStock), unit);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Stock Item</DialogTitle>
          <DialogDescription>Create a new item to track in your inventory</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='item-name'>Item Name</Label>
              <Input
                id='item-name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g., Laptop, Office Chair'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='initial-stock'>Initial Stock</Label>
              <Input
                id='initial-stock'
                type='number'
                min='0'
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                placeholder='0'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='unit'>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id='unit'>
                  <SelectValue placeholder='Select unit' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='units'>Units</SelectItem>
                  <SelectItem value='boxes'>Boxes</SelectItem>
                  <SelectItem value='pieces'>Pieces</SelectItem>
                  <SelectItem value='kg'>Kilograms</SelectItem>
                  <SelectItem value='lbs'>Pounds</SelectItem>
                  <SelectItem value='liters'>Liters</SelectItem>
                  <SelectItem value='gallons'>Gallons</SelectItem>
                  <SelectItem value='reams'>Reams</SelectItem>
                  <SelectItem value='cartons'>Cartons</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex gap-3 mt-6'>
            <Button type='submit' className='flex-1'>
              Add Item
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
