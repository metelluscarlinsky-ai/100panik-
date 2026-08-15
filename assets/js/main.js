// Sistèm panye (localStorage)
function getCart(){return JSON.parse(localStorage.getItem('100panik_cart'))||[]}
function saveCart(cart){localStorage.setItem('100panik_cart',JSON.stringify(cart))}
function addToCart(id,name,price){let cart=getCart();const exist=cart.find(i=>i.id===id);if(exist)exist.quantity++;else cart.push({id,name,price,quantity:1});saveCart(cart);updateAllBadges();alert('✅ Ajoute nan panye!')}
function updateCartBadge(){const cart=getCart();const total=cart.reduce((s,i)=>s+i.quantity,0);document.querySelectorAll('.cart-badge').forEach(el=>el.textContent=total)}
function updateAllBadges(){updateCartBadge()}
// Sistèm swè (senp)
function toggleWishlist(btn){btn.style.background=btn.style.background==='var(--gold)'?'transparent':'var(--gold)';btn.style.color=btn.style.color==='var(--black)'?'var(--white)':'var(--black)'}
// Slider
function initSlider(){let current=0;const slides=document.querySelectorAll('.hero-slide');if(!slides.length)return;const prev=document.getElementById('sliderPrev');const next=document.getElementById('sliderNext');function show(i){slides.forEach((s,idx)=>s.classList.toggle('active',idx===i))}if(prev)prev.addEventListener('click',()=>{current=(current-1+slides.length)%slides.length;show(current)});if(next)next.addEventListener('click',()=>{current=(current+1)%slides.length;show(current)});setInterval(()=>{current=(current+1)%slides.length;show(current)},5000)}
// Anrejistre evènman yo
document.addEventListener('DOMContentLoaded',()=>{
  updateCartBadge();
  document.querySelectorAll('.add-to-cart-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const card=btn.closest('.product-card-3d')||btn.closest('article');
      const id=btn.dataset.id;
      const name=card?card.querySelector('.product-card-name').textContent:'Pwodwi';
      const priceText=card?card.querySelector('.product-card-price-main').textContent:'0';
      const price=parseFloat(priceText.replace(/[^0-9.]/g,''));
      addToCart(id,name,price);
    });
  });
  document.querySelectorAll('.wishlist-btn').forEach(btn=>btn.addEventListener('click',()=>toggleWishlist(btn)));
  initSlider();
});
