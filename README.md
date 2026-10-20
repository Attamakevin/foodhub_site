# The Foodhub by CWC - website (Vercel)

Customers pay on Paystack. Only after the server confirms the payment with Paystack does the site show the "Continue to WhatsApp" button.

## Folder
- public/index.html : the whole shop (home, menu, Our Story, Meet the Team, Reviews, cart, checkout, admin)
- public/logo.png and public/favicon.png : your logo (replace these files to change it)
- api/pay.js : checks the cart and delivery fee on the server, then starts the Paystack payment
- api/verify.js : confirms the payment with Paystack and returns the WhatsApp link
- api/webhook.js : Paystack tells the server about every successful payment, so the order is recorded even if the customer closes the page
- api/orders.js : the paid orders list in the admin
- api/menu.js, api/admin.js, api/upload.js : load the menu, save menu changes, upload photos
- lib/seed.js : starting menu (used until you save changes in the admin)

## Setup
1. Create a free GitHub repository and upload this folder's contents (or use the Vercel CLI).
2. On vercel.com choose Add New > Project, and import the repository. Leave the build settings as they are.
3. In the project, open Storage, create a Blob store with **Public** access and connect it to the project. Vercel adds BLOB_STORE_ID and BLOB_WEBHOOK_PUBLIC_KEY automatically, and the site signs in to the store by itself. You do not need a BLOB_READ_WRITE_TOKEN.
4. In Settings > Environment Variables add:
   - PAYSTACK_SECRET_KEY : your Paystack secret key (start with the sk_test_ key)
   - ADMIN_PASSWORD : a strong password for the admin
   - SITE_URL : your live address, for example https://www.yourdomain.com
   - Optional, for an email on every paid order: RESEND_API_KEY, OWNER_EMAIL (and MAIL_FROM once you verify a domain with Resend)
5. Redeploy so the variables take effect.
5b. In Paystack, open Settings > API Keys & Webhooks and set the Webhook URL to https://YOURDOMAIN/api/webhook (set it for both test and live modes). This is what confirms orders automatically.
6. Add your domain in Settings > Domains and follow Vercel's DNS instructions.

## Menu categories and packs
Categories: Promotional Offers, Bowls, Main Meals, Proteins, Sides, Pastries, Celebration Cakes, Drinks, Fresh Juices, Ice Creams. Only Main Meals need a pack. The pack names and prices are set in the admin under Settings and Delivery, and the pack price is added to the meal price. Group Packages and Office Meals are sub-headings inside Promotional Offers.
If an older saved menu is found, the site keeps your WhatsApp number, address, hours and delivery settings and starts from the new menu.

## Meet the Team
Our Story has a second page, Meet the Team (the title can be changed in the admin). Add the MD/CEO, the management team and the wider team under Admin > Team, with a photo, role and short bio. Members can be switched on or off and reordered.

## Orders and CSV export
Admin > View Orders lists paid orders with the time each order came in (Lagos time) and the time it was marked Done, or Ready for pickup for pickup orders. Filter by date or status, then press Export CSV. The file opens in Excel or Google Sheets and includes both times and the minutes taken.

## Using the admin
Open your-site.com/#/admin, log in with ADMIN_PASSWORD, use the tabs to manage Menu and Offers (click Edit on a product to change it, and use its on/off switch to mark it available or sold out, which saves straight away), Reviews (text and screenshots), Team, and Settings and Delivery (details, packs, Our Story text, banners, delivery), then press Save and Publish.

## Orders
Every confirmed payment is saved automatically and appears at your-site.com/#/orders (after admin login), where you can mark orders as Done. Paystack also emails you each payment, and Resend can email the full order if you set it up.
Privacy note: orders are stored in the same Blob store as the menu, under unguessable web addresses, and are only listed through the admin login. For stronger protection of customer details, move orders to a database later.

## Before going live
- Test a full order with the Paystack test key, then swap in the live secret key and redeploy.
- Replace the placeholder prices and the placeholder WhatsApp number in the admin.
- Upload your banners and product photos in the admin.
- Make a test payment and check that it shows on the Orders page. If it does not, check the webhook URL in Paystack.
