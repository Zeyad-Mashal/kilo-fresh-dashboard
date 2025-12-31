import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Category from "./Pages/Category/Category";
import Product from "./Pages/Product/Product";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/category" element={<Category />} />
        <Route path="/product" element={<Product />} />
        <Route path="/" element={<Category />} />
      </Routes>
    </Router>
  );
}

export default App;
