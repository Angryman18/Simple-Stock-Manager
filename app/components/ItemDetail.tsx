import { useState } from "react";
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  Calendar,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import { StockItem, StockTransaction } from "../StockManagerApp";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface ItemDetailProps {
  item: StockItem;
  transactions: StockTransaction[];
  onBack: () => void;
  onStockIn: (quantity: number, notes?: string) => void;
  onStockOut: (quantity: number, personName: string) => void;
  onEditTransaction: (
    transactionId: string,
    quantity: number,
    personName?: string,
    notes?: string
  ) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

export function ItemDetail({
  item,
  transactions,
  onBack,
  onStockIn,
  onStockOut,
  onEditTransaction,
  onDeleteTransaction,
}: ItemDetailProps) {
  const [showStockInForm, setShowStockInForm] = useState(false);
  const [showStockOutForm, setShowStockOutForm] = useState(false);
  const [stockInQuantity, setStockInQuantity] = useState("");
  const [stockInNotes, setStockInNotes] = useState("");
  const [stockOutQuantity, setStockOutQuantity] = useState("");
  const [personName, setPersonName] = useState("");

  const [editingTransaction, setEditingTransaction] = useState<StockTransaction | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editPersonName, setEditPersonName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);

  const sortedTransactions = [...transactions].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(stockInQuantity);
    if (quantity > 0) {
      onStockIn(quantity, stockInNotes || undefined);
      setStockInQuantity("");
      setStockInNotes("");
      setShowStockInForm(false);
    }
  };

  const handleStockOut = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(stockOutQuantity);
    if (quantity > 0 && personName.trim()) {
      onStockOut(quantity, personName);
      setStockOutQuantity("");
      setPersonName("");
      setShowStockOutForm(false);
    }
  };

  const handleEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const quantity = parseInt(editQuantity);
    if (quantity > 0) {
      onEditTransaction(
        editingTransaction.id,
        quantity,
        editPersonName || undefined,
        editNotes || undefined
      );
      setEditingTransaction(null);
    }
  };

  const openEditDialog = (transaction: StockTransaction) => {
    setEditingTransaction(transaction);
    setEditQuantity(transaction.quantity.toString());
    setEditPersonName(transaction.personName || "");
    setEditNotes(transaction.notes || "");
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-6'>
      {/* Header */}
      <div className='bg-white shadow-sm sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <Button variant='ghost' onClick={onBack} className='mb-3'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Dashboard
          </Button>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>{item.name}</h1>
              <p className='text-sm text-gray-600 mt-1'>
                Added {item.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-3xl font-bold text-gray-900'>{item.currentStock}</p>
              <p className='text-sm text-gray-600'>{item.unit} in stock</p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-6'>
        {/* Quick Actions */}
        <div className='grid grid-cols-2 gap-3 mb-6'>
          <Button
            onClick={() => {
              setShowStockInForm(true);
              setShowStockOutForm(false);
            }}
            className='bg-green-600 hover:bg-green-700'
          >
            <ArrowDownToLine className='w-5 h-5 mr-2' />
            <span>Stock In</span>
          </Button>
          <Button
            onClick={() => {
              setShowStockOutForm(true);
              setShowStockInForm(false);
            }}
            className='bg-red-600 hover:bg-red-700'
          >
            <ArrowUpFromLine className='w-5 h-5 mr-2' />
            <span>Stock Out</span>
          </Button>
        </div>

        {/* Stock In Form */}
        {showStockInForm && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Add Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStockIn}>
                <div className='space-y-4'>
                  <div className='flex flex-col space-y-2'>
                    <Label htmlFor='stock-in-quantity'>Quantity</Label>
                    <Input
                      id='stock-in-quantity'
                      type='number'
                      min='1'
                      value={stockInQuantity}
                      onChange={(e) => setStockInQuantity(e.target.value)}
                      placeholder={`Enter quantity in ${item.unit}`}
                      required
                    />
                  </div>
                  <div className='flex flex-col space-y-2'>
                    <Label htmlFor='stock-in-notes'>Notes (optional)</Label>
                    <Input
                      id='stock-in-notes'
                      type='text'
                      value={stockInNotes}
                      onChange={(e) => setStockInNotes(e.target.value)}
                      placeholder='Add notes about this stock'
                    />
                  </div>
                </div>
                <div className='flex gap-3 mt-4'>
                  <Button type='submit' className='flex-1 bg-green-600 hover:bg-green-700'>
                    Confirm Stock In
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setShowStockInForm(false);
                      setStockInQuantity("");
                      setStockInNotes("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stock Out Form */}
        {showStockOutForm && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Release Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStockOut}>
                <div className='space-y-4'>
                  <div className='flex flex-col space-y-2'>
                    <Label htmlFor='stock-out-quantity'>Quantity</Label>
                    <Input
                      id='stock-out-quantity'
                      type='number'
                      min='1'
                      max={item.currentStock}
                      value={stockOutQuantity}
                      onChange={(e) => setStockOutQuantity(e.target.value)}
                      placeholder={`Max: ${item.currentStock} ${item.unit}`}
                      required
                    />
                  </div>
                  <div className='flex flex-col space-y-2'>
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
                <div className='flex gap-3 mt-4'>
                  <Button type='submit' className='flex-1 bg-red-600 hover:bg-red-700'>
                    Confirm Stock Out
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setShowStockOutForm(false);
                      setStockOutQuantity("");
                      setPersonName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Transaction History</h2>
          <div className='space-y-3'>
            {sortedTransactions.length === 0 ? (
              <Card>
                <CardContent className='py-8 text-center'>
                  <Package className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-600'>No transactions yet</p>
                </CardContent>
              </Card>
            ) : (
              sortedTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className='pt-6'>
                    <div className='flex items-start gap-3'>
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === "in" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {transaction.type === "in" ? (
                          <ArrowDownToLine className='w-5 h-5 text-green-600' />
                        ) : (
                          <ArrowUpFromLine className='w-5 h-5 text-red-600' />
                        )}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-start justify-between mb-2'>
                          <div>
                            <p className='font-semibold text-gray-900'>
                              {transaction.type === "in" ? "Stock In" : "Stock Out"}
                            </p>
                            <p
                              className={`text-lg font-bold ${
                                transaction.type === "in" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.type === "in" ? "+" : "-"}
                              {transaction.quantity} {item.unit}
                            </p>
                          </div>
                          <div className='flex items-start gap-2'>
                            <div className='text-right'>
                              <div className='flex items-center gap-1 text-sm text-gray-600'>
                                <Calendar className='w-4 h-4' />
                                {transaction.timestamp.toLocaleDateString()}
                              </div>
                              <p className='text-xs text-gray-500 mt-1'>
                                {transaction.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            <div className='flex gap-1'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                                onClick={() => openEditDialog(transaction)}
                              >
                                <Edit className='w-4 h-4 text-blue-600' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                                onClick={() => setDeletingTransactionId(transaction.id)}
                              >
                                <Trash2 className='w-4 h-4 text-red-600' />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {transaction.personName && (
                          <div className='flex items-center gap-1 text-sm text-gray-700 mt-2'>
                            <User className='w-4 h-4' />
                            <span>
                              Released to:{" "}
                              <span className='font-medium'>{transaction.personName}</span>
                            </span>
                          </div>
                        )}
                        {transaction.notes && (
                          <p className='text-sm text-gray-600 mt-2 italic'>{transaction.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the details of this transaction</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTransaction}>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='edit-quantity'>Quantity</Label>
                <Input
                  id='edit-quantity'
                  type='number'
                  min='1'
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  required
                />
              </div>
              {editingTransaction?.type === "out" && (
                <div>
                  <Label htmlFor='edit-person'>Released To</Label>
                  <Input
                    id='edit-person'
                    type='text'
                    value={editPersonName}
                    onChange={(e) => setEditPersonName(e.target.value)}
                    placeholder="Enter person's name"
                  />
                </div>
              )}
              <div>
                <Label htmlFor='edit-notes'>Notes (optional)</Label>
                <Input
                  id='edit-notes'
                  type='text'
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder='Add notes'
                />
              </div>
            </div>
            <div className='flex gap-3 mt-6'>
              <Button type='submit' className='flex-1'>
                Update Transaction
              </Button>
              <Button type='button' variant='outline' onClick={() => setEditingTransaction(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTransactionId}
        onOpenChange={(open) => !open && setDeletingTransactionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This will adjust the current stock
              level and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingTransactionId) {
                  onDeleteTransaction(deletingTransactionId);
                  setDeletingTransactionId(null);
                }
              }}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
