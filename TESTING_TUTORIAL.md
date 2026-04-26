# DS Flow End-to-End Testing Tutorial

Follow these exact steps to fully test the connection between your WordPress site, WooCommerce, and the DS Flow Dashboard.

## Step 1: Create a Site Record in the Database
Before the plugin can connect, you need to register a "Site" in your database and generate a secure token. Since we haven't built the "Add Site" UI button yet, we will do this directly in Supabase.

1. Go to your **Supabase Dashboard** -> **Table Editor**.
2. Select the `Site` table.
3. Click **Insert Row** and fill in:
   - `connectionKey`: `my-secret-key-123`
   - `status`: `PENDING`
   - `userId`: Look up your Admin User's ID in the `User` table and paste it here so the site belongs to you.
   *(Leave `domain` and `siteToken` empty, the system will auto-generate them during the handshake!)*
4. Click **Save**.

## Step 2: Install the WordPress Plugin
1. Open your WordPress Admin Dashboard.
2. Go to **Plugins** -> **Add New Plugin** (or **Add New**).
3. Click the **Upload Plugin** button at the top of the screen.
4. Click **Choose File** and select the `ds-flow-plugin.zip` file located in your `DS Flow` folder.
5. Click **Install Now**, and once it finishes, click **Activate Plugin**.

## Step 3: Connect WordPress to the Dashboard
1. In your WordPress Admin Dashboard, look for the new **DS Flow Settings** menu.
2. In the settings page, enter the `connectionKey` you created earlier (`my-secret-key-123`).
3. Click **Connect**.
4. The plugin will securely reach out to your dashboard, exchange the key for a permanent `siteToken`, and automatically set up your default promo slots!

## Step 4: Sync WooCommerce Products
1. Make sure WooCommerce is installed and you have created a few **Simple Products** with prices and images.
2. In the DS Flow Settings page in WordPress, click the **Manual Sync Products** button.
3. The plugin will package your WooCommerce products and send them to the Dashboard!

## Step 5: Build Your Promo Section
1. Open the DS Flow Dashboard in your browser (`http://localhost:3000/dashboard/builder`).
2. Log in with your Admin credentials.
3. Select a Slot (e.g., `evergreen-offers`).
4. Update the Text, Theme, and add some **Product Cards**. 
   *(Note: For the mock preview, the products drop-down isn't wired yet, but when you hit publish, the configuration saves!)*
5. Click **Publish**.

## Step 6: Render the Shortcode on WordPress
1. Go to your WordPress Admin Dashboard -> **Pages** -> **Add New**.
2. Add a standard Shortcode block to the page.
3. Type: `[ds_flow slot="evergreen-offers"]`
4. Publish the WordPress page and view it.

**Result**: The WordPress page will instantly reach out to your Next.js Dashboard, grab the published configuration, and render the beautiful Promo Grid exactly as you designed it!

> [!TIP]
> If the Next.js server goes down, refresh the WordPress page. You will see that the Promo Grid still loads perfectly because the plugin automatically cached the configuration!
