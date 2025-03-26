import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; // Thêm dòng này
import store from "./store/store.js"; // Thêm dòng này, kiểm tra đường dẫn đúng
import App from "./App.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}> {/* Bọc App bằng Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
