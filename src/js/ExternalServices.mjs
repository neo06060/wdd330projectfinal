// ExternalServices.mjs
export default class ExternalServices {
  async checkout(payload) {
    const url = "http://wdd330-backend.onrender.com/checkout";
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error("Checkout failed");
    return response.json();
  }
}
