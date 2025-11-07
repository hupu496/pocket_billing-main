// Application State
class EZOBillingApp {
  constructor() {
   
    this.menuItems = [
      { id: 1, name: "Idli", price: 50, image: "", category: "South Indian" },
      { id: 2, name: "Dosa", price: 100, image: "Masala-Dosa.jpg", category: "South Indian" },
      { id: 3, name: "Vada", price: 50, image: "Vada.jpg", category: "South Indian" },
      { id: 4, name: "Biryani", price: 150, image: "Veg-Dum-Biryani.jpg", category: "Rice" },
      { id: 5, name: "Noodles", price: 150, image: "Noodles.jpg", category: "Chinese" },
      { id: 6, name: "Pao Bhaji", price: 150, image: "PavBhaji.jpg", category: "Street Food" },
      { id: 7, name: "Chicken Curry", price: 250, image: "red-chicken-curry.jpg", category: "Non-Veg",},
      { id: 8, name: "Chicken Biryani", price: 250, image: "Chicken Briyani.jpg", category: "Non-Veg" },
      { id: 9, name: "Veg Thali", price: 230, image: "Veg-thali.jpg", category: "Thali" },
      { id: 10, name: "Samosa", price: 40, image: "Samosa.jpg", category: "Street Food" },
      { id: 11, name: "Chole Bhature", price: 120, image: "Chole bhatura.jpg", category: "Street Food" },
      { id: 12, name: "Coffee", price: 110, image: "Coffee.jpeg", category: "Beverages" },
      { id: 13, name: "Masala Chai", price: 30, image: "Masala Chai.jpg", category: "Beverages" },
      { id: 14, name: "Lassi", price: 60, image: "Lassi.jpeg", category: "Beverages" },
      { id: 15, name: "Gulab Jamun", price: 80, image: "Gulab Jamun.jpg", category: "Desserts" }
    ];
    this.cart = {}
    this.paymentMethod = "cash"
    this.discount = { type: "percentage", value: 0, reason: "" }
    this.orderHistory = []

    // Double tap handling
    this.tapTimeout = null
    this.tapCount = 0
    this.lastTapTime = 0

    this.init()
  }

  init() {
    this.renderMenuItems()
    this.updateTotal()
    this.setupEventListeners()
    console.log("EZO Billing App initialized successfully!")
  }

  setupEventListeners() {
    // Discount value input listener
    const discountValue = document.getElementById("discountValue")
    if (discountValue) {
      discountValue.addEventListener("input", () => this.updateDiscountPreview())
    }

    // Form validation
    const discountForm = document.getElementById("discountForm")
    if (discountForm) {
      discountForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.applyDiscount()
      })
    }
  }

renderMenuItems() {
  const container = document.getElementById("menuGrid");
  if (!container) return;

  container.innerHTML = "";

  this.menuItems.forEach((item) => {
    const quantity = this.cart[item.id] || 0;

    const itemElement = document.createElement("div");
    itemElement.className = "col-4 mb-3";

    // Default image style with pointer-events: none to prevent clicking
    const defaultStyle = 'width: 100%; height: 70px; object-fit: cover; border-radius: 6px;';
    
    itemElement.innerHTML = `
      <div class="menu-item" data-item-id="${item.id}">
        <div class="image-container" style="display: flex; justify-content: center;">
          <img src="${item.image}" alt="${item.name}" 
               style="${item.imageStyle || defaultStyle}"
               class="item-image ${item.imageStyle ? 'custom-size' : ''}" 
               loading="lazy">
        </div>
        <div class="item-name">${item.name}</div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="item-price">₹${item.price}</span>
          <div class="quantity-container">
            <button class="add-btn" onclick="app.addToCart(${item.id}, event)">+</button>
            ${quantity > 0 ? `<span class="quantity-badge">${quantity}</span>` : ""}
          </div>
        </div>
      </div>
    `;

    container.appendChild(itemElement);
    this.addDoubleTapListener(itemElement.querySelector(".menu-item"), item.id);
  });
}

  addDoubleTapListener(element, itemId) {
    let touchStartTime = 0
    let touchCount = 0

    const handleTap = (e) => {
      const currentTime = new Date().getTime()
      const timeDiff = currentTime - touchStartTime

      if (timeDiff < 300 && timeDiff > 0) {
        touchCount++
        if (touchCount === 1) {
          // Double tap detected
          this.handleDoubleTap(element, itemId)
          touchCount = 0
          e.preventDefault()
          return
        }
      } else {
        touchCount = 1
      }

      touchStartTime = currentTime

      // Reset count after delay
      setTimeout(() => {
        touchCount = 0
      }, 300)
    }

    element.addEventListener("touchstart", handleTap, { passive: false })
    element.addEventListener("click", handleTap)
  }
singleAddToCart(itemId) {
  // Prevent the default click behavior
  event.stopPropagation();
  
  // Add just one item
  this.addToCart(itemId, 1);
  
  // Show single item added feedback
  const item = this.getItemById(itemId);
  console.log(`Single tap: Added 1x ${item.name}`);
}
  handleDoubleTap(element, itemId) {
  // Add 2 items to cart
  this.addToCart(itemId, 2);

  // Visual feedback
  element.classList.add("double-tap-animation");
  setTimeout(() => {
    element.classList.remove("double-tap-animation");
  }, 400);

  // Haptic feedback (if supported)
  if (navigator.vibrate) {
    navigator.vibrate([50, 50, 50]);
  }

  const item = this.getItemById(itemId);
  console.log(`Double tap: Added 1x ${item.name}`);
 
}

  addToCart(itemId, quantity = 1) {
    if (!this.cart[itemId]) {
      this.cart[itemId] = 0
    }
    this.cart[itemId] += quantity
   
    this.renderMenuItems()
    this.updateTotal()

    // Show feedback
     this.showToast(`Added ${quantity}x ${this.getItemById(itemId).name}`, "success")
  }

  removeFromCart(itemId, quantity = 1) {
    if (this.cart[itemId]) {
      this.cart[itemId] -= quantity
      if (this.cart[itemId] <= 0) {
        delete this.cart[itemId]
      }
      this.renderMenuItems()
      this.updateTotal()
    }
  }

  updateTotal() {
    let total = 0

    Object.keys(this.cart).forEach((itemId) => {
      const item = this.getItemById(itemId)
      if (item) {
        total += item.price * this.cart[itemId]
      }
    })

    const totalDisplay = document.getElementById("totalDisplay")
    if (totalDisplay) {
      totalDisplay.textContent = total.toString().padStart(2, "0")
    }

    return total
  }

  getItemById(id) {
    return this.menuItems.find((item) => item.id == id)
  }
  
  selectPaymentMethod(method) {
    this.paymentMethod = method

  //   // Update UI
  //   document.querySelectorAll(".payment-btn").forEach((btn) => {
  //     btn.classList.remove("active")
  //   })

  //   const activeBtn = document.querySelector(`[data-method="${method}"]`)
  //   if (activeBtn) {
  //     activeBtn.classList.add("active")
  //   }

  //   console.log(`Payment method selected: ${method}`)
  // }

  // // processOrder() {
  // //   if (Object.keys(this.cart).length === 0) {
  // //     this.showToast("Please add items to cart before processing order", "warning")
  // //     return
  // //   }

  //   // Show discount modal
  //   const discountModal = window.bootstrap.Modal(document.getElementById("discountModal"))
  //   discountModal.show()
  // }

  // updateDiscountPlaceholder() {
  //   const discountType = document.getElementById("discountType").value
  //   const discountValue = document.getElementById("discountValue")

  //   if (discountType === "percentage") {
  //     discountValue.placeholder = "Enter discount percentage (e.g., 10)"
  //     discountValue.max = "100"
  //   } else {
  //     discountValue.placeholder = "Enter discount amount (e.g., 50)"
  //     discountValue.removeAttribute("max")
  //   }

  //   this.updateDiscountPreview()
  // }

  // updateDiscountPreview() {
  //   const discountType = document.getElementById("discountType").value
  //   const discountValue = Number.parseFloat(document.getElementById("discountValue").value) || 0
  //   const preview = document.getElementById("discountPreview")
  //   const previewText = document.getElementById("discountPreviewText")

  //   if (discountValue > 0) {
  //     const subtotal = this.updateTotal()
  //     let discountAmount = 0

  //     if (discountType === "percentage") {
  //       discountAmount = (subtotal * discountValue) / 100
  //       previewText.innerHTML = `
  //                   <strong>Discount:</strong> ${discountValue}% = ₹${discountAmount.toFixed(2)}<br>
  //                   <strong>Final Total:</strong> ₹${(subtotal - discountAmount).toFixed(2)}
  //               `
  //     } else {
  //       discountAmount = Math.min(discountValue, subtotal)
  //       previewText.innerHTML = `
  //                   <strong>Discount:</strong> ₹${discountAmount.toFixed(2)}<br>
  //                   <strong>Final Total:</strong> ₹${(subtotal - discountAmount).toFixed(2)}
  //               `
  //     }

  //     preview.style.display = "block"
  //   } else {
  //     preview.style.display = "none"
  //   }
  // }

  // applyDiscount() {
  //   const discountType = document.getElementById("discountType").value
  //   const discountValue = Number.parseFloat(document.getElementById("discountValue").value) || 0
  //   const discountReason = document.getElementById("discountReason").value.trim()

  //   // Validation
  //   if (discountValue < 0) {
  //     this.showToast("Discount value cannot be negative", "error")
  //     return
  //   }

  //   if (discountType === "percentage" && discountValue > 100) {
  //     this.showToast("Percentage discount cannot exceed 100%", "error")
  //     return
  //   }

  //   this.discount = {
  //     type: discountType,
  //     value: discountValue,
  //     reason: discountReason,
  //   }

  // //   // Close discount modal and show bill
  //   window.bootstrap.Modal.getInstance(document.getElementById("discountModal")).hide()
  //   this.generateBill()
  // }

  // generateBill() {
  //   const subtotal = this.updateTotal()
  //   let billItems = ""
  //   let itemCount = 0

  //   // Generate bill items
  //   Object.keys(this.cart).forEach((itemId) => {
  //     const item = this.getItemById(itemId)
  //     if (item && this.cart[itemId] > 0) {
  //       const quantity = this.cart[itemId]
  //       const itemTotal = item.price * quantity
  //       itemCount += quantity

  //       billItems += `
  //                   <div class="bill-item">
  //                       <span>${item.name} x ${quantity}</span>
  //                       <span>₹${itemTotal}</span>
  //                   </div>
  //               `
  //     }
  //   })

    // // Calculate discount
    // let discountAmount = 0
    // if (this.discount.value > 0) {
    //   if (this.discount.type === "percentage") {
    //     discountAmount = (subtotal * this.discount.value) / 100
    //   } else {
    //     discountAmount = Math.min(this.discount.value, subtotal)
    //   }
    // }

    // const finalTotal = subtotal - discountAmount
    // const currentDate = new Date()
    // const orderNumber = "EZO" + Date.now().toString().slice(-6)

    // Generate bill HTML
    const billHTML = `
            <div class="bill-header">
                <h4>EZO Billing</h4>
                <p class="mb-1">Restaurant POS System</p>
                <small>Order #${orderNumber}</small><br>
                <small>${currentDate.toLocaleString()}</small>
            </div>
            
            <div class="bill-items">
                <div class="bill-item">
                    <span><strong>Items (${itemCount})</strong></span>
                    <span><strong>Amount</strong></span>
                </div>
                <hr style="margin: 8px 0;">
                ${billItems}
            </div>
            
            <div class="bill-summary">
                <div class="bill-item">
                    <span>Subtotal:</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                ${
                  discountAmount > 0
                    ? `
                    <div class="bill-item discount-info">
                        <span>Discount (${this.discount.type === "percentage" ? this.discount.value + "%" : "₹" + this.discount.value}):</span>
                        <span>-₹${discountAmount.toFixed(2)}</span>
                    </div>
                    ${this.discount.reason ? `<div class="bill-item"><small style="color: #666;">Reason: ${this.discount.reason}</small></div>` : ""}
                `
                    : ""
                }
                <div class="bill-item total-row">
                    <span>TOTAL:</span>
                    <span>₹${finalTotal.toFixed(2)}</span>
                </div>
                <div class="bill-item">
                    <span>Payment:</span>
                    <span class="text-capitalize">${this.paymentMethod}</span>
                </div>
            </div>
            
            <div class="bill-footer">
                <p class="mb-1"><strong>Thank you for your order!</strong></p>
                <small>Powered by EZO Billing System</small><br>
                <small>Visit again soon!</small>
            </div>
        `
    document.getElementById("billContent").innerHTML = billHTML

    // Show bill modal
    const billModal = window.bootstrap.Modal(document.getElementById("billModal"))
    billModal.show()

    // Store order in history
    this.orderHistory.push({
      orderNumber,
      items: { ...this.cart },
      subtotal,
      discount: { ...this.discount },
      discountAmount,
      total: finalTotal,
      paymentMethod: this.paymentMethod,
      timestamp: currentDate.toISOString(),
    })
  }

  printBill() {
    const billContent = document.getElementById("billContent").innerHTML
    const printWindow = window.open("", "_blank", "width=400,height=600")

    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>EZO Billing - Receipt</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        max-width: 350px; 
                        margin: 0 auto; 
                        padding: 20px;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .bill-header { 
                        text-align: center; 
                        border-bottom: 2px dashed #333; 
                        padding-bottom: 15px; 
                        margin-bottom: 20px; 
                    }
                    .bill-item { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 5px; 
                    }
                    .total-row { 
                        border-top: 2px dashed #333; 
                        padding-top: 10px; 
                        margin-top: 15px; 
                        font-weight: bold; 
                        font-size: 14px; 
                    }
                    .bill-footer { 
                        text-align: center; 
                        margin-top: 20px; 
                        padding-top: 15px; 
                        border-top: 1px dashed #666; 
                        font-size: 10px; 
                    }
                    .discount-info { color: #333; font-weight: bold; }
                    hr { border: 1px dashed #666; }
                </style>
            </head>
            <body class="print-area">
                ${billContent}
            </body>
            </html>
        `)

    printWindow.document.close()

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)

    console.log("Bill sent to printer")
  }

  completeBilling() {
    // Close bill modal
    window.bootstrap.Modal.getInstance(document.getElementById("billModal")).hide()

    // Show success modal
    const successModal = window.bootstrap.Modal(document.getElementById("successModal"))
    successModal.show()

    console.log("Order completed successfully")
  }

  resetApp() {
    // Clear cart and reset state
    this.cart = {}
    this.discount = { type: "percentage", value: 0, reason: "" }
    this.paymentMethod = "cash"

    // Reset UI
    this.renderMenuItems()
    this.updateTotal()
    this.selectPaymentMethod("cash")

    // Reset forms
    document.getElementById("discountForm").reset()
    document.getElementById("discountPreview").style.display = "none"

    console.log("App reset for new order")
  }

  showToast(message, type = "info") {
  }
}

// Global functions for HTML onclick events
function selectPaymentMethod(method) {
  app.selectPaymentMethod(method)
}

function processOrder() {
  app.processOrder()
}

function updateDiscountPlaceholder() {
  app.updateDiscountPlaceholder()
}

function applyDiscount() {
  app.applyDiscount()
}

function printBill() {
  app.printBill()
}

function completeBilling() {
  app.completeBilling()
}

function resetApp() {
  app.resetApp()
}

// Initialize app when DOM is loaded
let app
document.addEventListener("DOMContentLoaded", () => {
  app = new EZOBillingApp()
})

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`
document.head.appendChild(style)

// Import Bootstrap
const bootstrap = window.bootstrap