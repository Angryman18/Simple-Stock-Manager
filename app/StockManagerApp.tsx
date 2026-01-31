"use client";

import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { ItemDetail } from "./components/ItemDetail";
import { AddStockModal } from "./components/AddStockModal";
import { StockInModal } from "./components/StockInModal";
import { StockOutModal } from "./components/StockOutModal";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

export interface StockItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
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

export default function StockManagerApp() {
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: "1",
      name: "Laptop",
      currentStock: 25,
      unit: "units",
      createdAt: new Date("2024-01-10"),
    },
    {
      id: "2",
      name: "Office Chair",
      currentStock: 50,
      unit: "units",
      createdAt: new Date("2024-01-12"),
    },
    {
      id: "3",
      name: "Paper A4",
      currentStock: 120,
      unit: "reams",
      createdAt: new Date("2024-01-08"),
    },
  ]);

  const [transactions, setTransactions] = useState<StockTransaction[]>([
    {
      id: "t1",
      itemId: "1",
      type: "in",
      quantity: 30,
      timestamp: new Date("2024-01-10"),
      notes: "Initial stock",
    },
    {
      id: "t2",
      itemId: "1",
      type: "out",
      quantity: 5,
      personName: "John Smith",
      timestamp: new Date("2024-01-15"),
    },
    {
      id: "t3",
      itemId: "2",
      type: "in",
      quantity: 50,
      timestamp: new Date("2024-01-12"),
      notes: "Initial stock",
    },
    {
      id: "t4",
      itemId: "3",
      type: "in",
      quantity: 150,
      timestamp: new Date("2024-01-08"),
      notes: "Initial stock",
    },
    {
      id: "t5",
      itemId: "3",
      type: "out",
      quantity: 30,
      personName: "Sarah Johnson",
      timestamp: new Date("2024-01-14"),
    },
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);

  const addStockItem = (name: string, initialStock: number, unit: string) => {
    const newItem: StockItem = {
      id: Date.now().toString(),
      name,
      currentStock: initialStock,
      unit,
      createdAt: new Date(),
    };
    setStockItems([...stockItems, newItem]);

    if (initialStock > 0) {
      const transaction: StockTransaction = {
        id: `t${Date.now()}`,
        itemId: newItem.id,
        type: "in",
        quantity: initialStock,
        timestamp: new Date(),
        notes: "Initial stock",
      };
      setTransactions([...transactions, transaction]);
    }
    setShowAddModal(false);
  };

  const stockIn = (itemId: string, quantity: number, notes?: string) => {
    setStockItems(
      stockItems.map((item) =>
        item.id === itemId ? { ...item, currentStock: item.currentStock + quantity } : item
      )
    );

    const transaction: StockTransaction = {
      id: `t${Date.now()}`,
      itemId,
      type: "in",
      quantity,
      timestamp: new Date(),
      notes,
    };
    setTransactions([...transactions, transaction]);
    setShowStockInModal(false);
  };

  const stockOut = (itemId: string, quantity: number, personName: string) => {
    const item = stockItems.find((i) => i.id === itemId);
    if (!item || item.currentStock < quantity) {
      toast.error("Insufficient stock!");
      return;
    }

    setStockItems(
      stockItems.map((item) =>
        item.id === itemId ? { ...item, currentStock: item.currentStock - quantity } : item
      )
    );

    const transaction: StockTransaction = {
      id: `t${Date.now()}`,
      itemId,
      type: "out",
      quantity,
      personName,
      timestamp: new Date(),
    };
    setTransactions([...transactions, transaction]);
    setShowStockOutModal(false);
    toast.success("Stock released successfully");
  };

  const editTransaction = (
    transactionId: string,
    quantity: number,
    personName?: string,
    notes?: string
  ) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    const item = stockItems.find((i) => i.id === transaction.itemId);
    if (!item) return;

    // Revert the old transaction
    const oldQuantity = transaction.quantity;
    const stockDiff = transaction.type === "in" ? -oldQuantity : oldQuantity;

    // Apply the new transaction
    const newStockDiff = transaction.type === "in" ? quantity : -quantity;
    const finalStock = item.currentStock + stockDiff + newStockDiff;

    if (finalStock < 0) {
      toast.error("Cannot update: would result in negative stock");
      return;
    }

    setStockItems(
      stockItems.map((item) =>
        item.id === transaction.itemId ? { ...item, currentStock: finalStock } : item
      )
    );

    setTransactions(
      transactions.map((t) => (t.id === transactionId ? { ...t, quantity, personName, notes } : t))
    );
    toast.success("Transaction updated successfully");
  };

  const deleteTransaction = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    const item = stockItems.find((i) => i.id === transaction.itemId);
    if (!item) return;

    // Revert the transaction
    const stockDiff = transaction.type === "in" ? -transaction.quantity : transaction.quantity;
    const finalStock = item.currentStock + stockDiff;

    if (finalStock < 0) {
      toast.error("Cannot delete: would result in negative stock");
      return;
    }

    setStockItems(
      stockItems.map((item) =>
        item.id === transaction.itemId ? { ...item, currentStock: finalStock } : item
      )
    );

    setTransactions(transactions.filter((t) => t.id !== transactionId));
    toast.success("Transaction deleted successfully");
  };

  const selectedItem = stockItems.find((item) => item.id === selectedItemId);

  return (
    <div className='min-h-screen bg-gray-50'>
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
