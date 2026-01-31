"use client";

import { useState, useEffect, useCallback } from "react";
import { Dashboard } from "./components/Dashboard";
import { ItemDetail } from "./components/ItemDetail";
import { AddStockModal } from "./components/AddStockModal";
import { StockInModal } from "./components/StockInModal";
import { StockOutModal } from "./components/StockOutModal";
import { UserButtonComponent } from "./components/UserButton";
import { LandingPage } from "./components/LandingPage";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "./components/LoadingSpinner";

export interface StockItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  price: number;
  createdAt: Date;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  type: "in" | "out";
  quantity: number;
  personName?: string;
  timestamp: Date;
  notes?: string;
}

// API response types
interface ApiStock {
  _id: string;
  product_name: string;
  user_id: string;
  created_at: number;
  updated_at: number;
  quantity: number;
  stock_count: number;
  unit: string;
  price: number;
}

interface ApiStockHistory {
  _id: string;
  product_id: string;
  user_id: string;
  created_at: number;
  change_type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
  notes: string | null;
}

// Transform API stock to StockItem
function transformStock(apiStock: ApiStock): StockItem {
  return {
    id: apiStock._id,
    name: apiStock.product_name,
    currentStock: apiStock.stock_count,
    unit: apiStock.unit,
    price: apiStock.price,
    createdAt: new Date(apiStock.created_at),
  };
}

// Transform API stock history to StockTransaction
function transformTransaction(apiHistory: ApiStockHistory): StockTransaction {
  return {
    id: apiHistory._id,
    itemId: apiHistory.product_id,
    type: apiHistory.change_type === "STOCK_IN" ? "in" : "out",
    quantity: apiHistory.quantity,
    timestamp: new Date(apiHistory.created_at),
    notes: apiHistory.notes || undefined,
  };
}

export default function StockManagerApp() {
  const { isLoaded, isSignedIn } = useAuth();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);

  // Fetch stocks from API
  const fetchStocks = useCallback(async () => {
    try {
      const response = await fetch("/api/stocks");
      if (!response.ok) {
        throw new Error("Failed to fetch stocks");
      }
      const data: ApiStock[] = await response.json();
      // Sort by updated_at descending (newest first), fallback to created_at if updated_at is not available
      const sortedData = [...data].sort((a, b) => {
        const aTime = a.updated_at || a.created_at;
        const bTime = b.updated_at || b.created_at;
        return bTime - aTime; // Descending order
      });
      setStockItems(sortedData.map(transformStock));
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast.error("Failed to load stocks");
    }
  }, []);

  // Fetch stock history from API
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/stock-history");
      if (!response.ok) {
        throw new Error("Failed to fetch stock history");
      }
      const data: ApiStockHistory[] = await response.json();
      setTransactions(data.map(transformTransaction));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        setIsLoading(true);
        setIsRequestLoading(true);
        Promise.all([fetchStocks(), fetchTransactions()]).finally(() => {
          setIsLoading(false);
          setIsRequestLoading(false);
        });
      } else {
        // User is not signed in, stop loading
        setIsLoading(false);
      }
    }
  }, [isLoaded, isSignedIn, fetchStocks, fetchTransactions]);

  // Add new stock item
  const addStockItem = async (name: string, initialStock: number, unit: string) => {
    try {
      setIsRequestLoading(true);
      // Create the stock
      const response = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: name,
          quantity: initialStock,
          stock_count: initialStock,
          unit,
          price: 0, // Default price
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create stock");
      }

      const { id } = await response.json();

      // If there's initial stock, create a stock-in history entry
      if (initialStock > 0) {
        await fetch("/api/stock-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: id,
            change_type: "STOCK_IN",
            quantity: initialStock,
            notes: "Initial stock",
          }),
        });
      }

      // Refresh data
      await Promise.all([fetchStocks(), fetchTransactions()]);
      setShowAddModal(false);
      toast.success("Stock item added successfully");
    } catch (error) {
      console.error("Error adding stock:", error);
      toast.error("Failed to add stock item");
    } finally {
      setIsRequestLoading(false);
    }
  };

  // Stock in operation
  const stockIn = async (itemId: string, quantity: number, notes?: string) => {
    try {
      setIsRequestLoading(true);
      const response = await fetch(`/api/stocks/${itemId}/stock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to stock in");
      }

      // Refresh data
      await Promise.all([fetchStocks(), fetchTransactions()]);
      setShowStockInModal(false);
      toast.success("Stock added successfully");
    } catch (error) {
      console.error("Error stocking in:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add stock");
    } finally {
      setIsRequestLoading(false);
    }
  };

  // Stock out operation
  const stockOut = async (itemId: string, quantity: number, personName: string) => {
    try {
      setIsRequestLoading(true);
      const response = await fetch(`/api/stocks/${itemId}/stock-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, notes: `Released to: ${personName}` }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to stock out");
      }

      // Refresh data
      await Promise.all([fetchStocks(), fetchTransactions()]);
      setShowStockOutModal(false);
      toast.success("Stock released successfully");
    } catch (error) {
      console.error("Error stocking out:", error);
      toast.error(error instanceof Error ? error.message : "Failed to release stock");
    } finally {
      setIsRequestLoading(false);
    }
  };

  // Edit transaction
  const editTransaction = async (
    transactionId: string,
    quantity: number,
    personName?: string,
    notes?: string
  ) => {
    try {
      setIsRequestLoading(true);
      const transaction = transactions.find((t) => t.id === transactionId);
      if (!transaction) {
        setIsRequestLoading(false);
        return;
      }

      const item = stockItems.find((i) => i.id === transaction.itemId);
      if (!item) {
        setIsRequestLoading(false);
        return;
      }

      // Calculate the stock difference
      const oldQuantity = transaction.quantity;
      const stockDiff = transaction.type === "in" ? -oldQuantity : oldQuantity;
      const newStockDiff = transaction.type === "in" ? quantity : -quantity;
      const finalStock = item.currentStock + stockDiff + newStockDiff;

      if (finalStock < 0) {
        toast.error("Cannot update: would result in negative stock");
        setIsRequestLoading(false);
        return;
      }

      // Update the transaction
      const response = await fetch(`/api/stock-history/${transactionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          notes: personName ? `Released to: ${personName}` : notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      // Update the stock count
      await fetch(`/api/stocks/${transaction.itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_count: finalStock,
        }),
      });

      // Refresh data
      await Promise.all([fetchStocks(), fetchTransactions()]);
      toast.success("Transaction updated successfully");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    } finally {
      setIsRequestLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId: string) => {
    try {
      setIsRequestLoading(true);
      const transaction = transactions.find((t) => t.id === transactionId);
      if (!transaction) {
        setIsRequestLoading(false);
        return;
      }

      const item = stockItems.find((i) => i.id === transaction.itemId);
      if (!item) {
        setIsRequestLoading(false);
        return;
      }

      // Calculate the reverted stock
      const stockDiff = transaction.type === "in" ? -transaction.quantity : transaction.quantity;
      const finalStock = item.currentStock + stockDiff;

      if (finalStock < 0) {
        toast.error("Cannot delete: would result in negative stock");
        setIsRequestLoading(false);
        return;
      }

      // Delete the transaction
      const response = await fetch(`/api/stock-history/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      // Update the stock count
      await fetch(`/api/stocks/${transaction.itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_count: finalStock,
        }),
      });

      // Refresh data
      await Promise.all([fetchStocks(), fetchTransactions()]);
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    } finally {
      setIsRequestLoading(false);
    }
  };

  const selectedItem = stockItems.find((item) => item.id === selectedItemId);

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return <LandingPage />;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <LoadingSpinner isLoading={isRequestLoading} />
      <UserButtonComponent />
      {selectedItemId && selectedItem ? (
        <ItemDetail
          item={selectedItem}
          transactions={transactions.filter((t) => t.itemId === selectedItemId)}
          onBack={() => setSelectedItemId(null)}
          onStockIn={(quantity, notes) => stockIn(selectedItemId, quantity, notes)}
          onStockOut={(quantity, personName) => stockOut(selectedItemId, quantity, personName)}
          onEditTransaction={editTransaction}
          onDeleteTransaction={deleteTransaction}
        />
      ) : (
        <Dashboard
          items={stockItems}
          onItemClick={(id) => setSelectedItemId(id)}
          onAddStock={() => setShowAddModal(true)}
          onStockIn={() => setShowStockInModal(true)}
          onStockOut={() => setShowStockOutModal(true)}
        />
      )}

      {showAddModal && (
        <AddStockModal onClose={() => setShowAddModal(false)} onAdd={addStockItem} />
      )}

      {showStockInModal && (
        <StockInModal
          items={stockItems}
          onClose={() => setShowStockInModal(false)}
          onStockIn={stockIn}
        />
      )}

      {showStockOutModal && (
        <StockOutModal
          items={stockItems}
          onClose={() => setShowStockOutModal(false)}
          onStockOut={stockOut}
        />
      )}

      <Toaster />
    </div>
  );
}
