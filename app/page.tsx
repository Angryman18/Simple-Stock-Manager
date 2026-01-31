import { ConvexClientProvider } from "./components/context/ConvexProvider";
import StockManagerApp from "./StockManagerApp";

export default function Home() {
  return (
    <ConvexClientProvider>
      <StockManagerApp />
    </ConvexClientProvider>
  );
}
