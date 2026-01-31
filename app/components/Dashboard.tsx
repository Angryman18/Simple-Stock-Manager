import { Plus, ArrowDownToLine, ArrowUpFromLine, Package } from "lucide-react";
import { StockItem } from "../StockManagerApp";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface DashboardProps {
  items: StockItem[];
  onItemClick: (id: string) => void;
  onAddStock: () => void;
  onStockIn: () => void;
  onStockOut: () => void;
}

export function Dashboard({
  items,
  onItemClick,
  onAddStock,
  onStockIn,
  onStockOut,
}: DashboardProps) {
  const getLowStockCount = () => {
    return items.filter((item) => item.currentStock < 20).length;
  };

  return (
    <div className='min-h-screen pb-20'>
      {/* Header */}
      <div className='bg-white shadow-sm sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Stock Manager</h1>
              <p className='text-sm text-gray-600 mt-1'>{items.length} items tracked</p>
            </div>
            <Button onClick={onAddStock}>
              <Plus className='w-4 h-4 mr-2' />
              New Stock
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-blue-100 p-2 rounded-lg'>
                  <Package className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Total Items</p>
                  <p className='text-2xl font-bold text-gray-900'>{items.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-orange-100 p-2 rounded-lg'>
                  <Package className='w-5 h-5 text-orange-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Low Stock</p>
                  <p className='text-2xl font-bold text-gray-900'>{getLowStockCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='col-span-2 sm:col-span-1'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-green-100 p-2 rounded-lg'>
                  <Package className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Total Stock</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {items.reduce((sum, item) => sum + item.currentStock, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Items */}
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Stock Items</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {items.map((item) => (
              <Card
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className='cursor-pointer hover:shadow-md transition-shadow'
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg'>{item.name}</CardTitle>
                      <CardDescription>Added {item.createdAt.toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge variant={item.currentStock < 20 ? "destructive" : "default"}>
                      {item.currentStock < 20 ? "Low" : "In Stock"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-end justify-between'>
                    <div>
                      <p className='text-3xl font-bold text-gray-900'>{item.currentStock}</p>
                      <p className='text-sm text-gray-600 mt-1'>{item.unit}</p>
                    </div>
                    <Button
                      variant='link'
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemClick(item.id);
                      }}
                      className='p-0 h-auto'
                    >
                      View Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {items.length === 0 && (
            <Card className='text-center'>
              <CardContent className='py-12'>
                <Package className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                <p className='text-gray-600 mb-4'>No stock items yet</p>
                <Button onClick={onAddStock}>Add Your First Item</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions - Fixed Bottom */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg'>
        <div className='max-w-7xl mx-auto px-4 py-3'>
          <div className='grid grid-cols-2 gap-3'>
            <Button
              onClick={onStockIn}
              variant='default'
              className='bg-green-600 hover:bg-green-700 h-14 text-base'
            >
              <ArrowDownToLine className='w-5 h-5 mr-2' />
              <span>Stock In</span>
            </Button>
            <Button
              onClick={onStockOut}
              variant='default'
              className='bg-red-600 hover:bg-red-700 h-14 text-base'
            >
              <ArrowUpFromLine className='w-5 h-5 mr-2' />
              <span>Stock Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
