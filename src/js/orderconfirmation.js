document.addEventListener("DOMContentLoaded", () => {
  const order = JSON.parse(sessionStorage.getItem("lastOrder") || "{}");
  const pre = document.getElementById("orderDetails");

  if (!order.items || !order.items.length) {
    pre.textContent = "No order data found.";
    return;
  }

  const formatted = `
Order Date: ${order.date}

Customer Information:
${Object.entries(order.customer || {}).map(([k,v]) => `${k}: ${v}`).join("\n")}

Items:
${order.items.map(it => `${it.Name ?? "Item"} x${it.quantity} - $${((it.FinalPrice ?? it.Price) * it.quantity).toFixed(2)}`).join("\n")}

Summary:
Subtotal: $${order.summary.subtotal.toFixed(2)}
Tax: $${order.summary.tax.toFixed(2)}
Shipping: $${order.summary.shipping.toFixed(2)}
Total: $${order.summary.total.toFixed(2)}
`;

  pre.textContent = formatted;

  // Download order as text file
  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const blob = new Blob([formatted], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "order.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
});
