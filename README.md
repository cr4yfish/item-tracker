# Item Tracker
Item Tracker is the next evolution of my FoodTracker App.

## What is it?
Item Tracker is a simple app that allows you to track items that you have in your home.  You can add items to your inventory, and then track when you use them.  You can also track when you buy more of an item, and the app will automatically update your inventory.

## Tech stack
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Edamame](https://developer.edamam.com/edamame)
- [Deepl](https://www.deepl.com/)
- [themealdb](https://www.themealdb.com/api.php)
- [Swiper.js](https://swiperjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [NextUI](https://nextui.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Material Icons](https://fonts.google.com/icons)

## Gettings started

### Pre-requisites
- A Supabase database with the following structure:
    - `items` table
        - `id` (UUID)
        - `created_at` (timestampz)
        - `name` (String)
        - `count` (Integer)
        - `category` (String) <-- This is a foreign key to the `categories` table
        - `date` (String) 
        - `place` (String)
    - `categories` table
        - `id` (UUID)
        `created_at` (timestampz)
        - `name` (String)
    - `Persons` table
        - `id` (UUID)
        - `created_at` (timestampz)
        - `name` (String)
    - `ShoppingList` table
        - `id` (UUID)
        - `created_at` (timestampz)
        - `item_id` (UUID)
        - `quantity` (Integer)
        - `date` (Date)
- (Optional) An Edamame API key for suggestions and other food related stuff

Note: This might be outdated, so just take a look at @/interfaces and see for yourself.

### Installation

#### Clone the repo
Do this however you like.

#### Install the dependencies
```bash
npm install
```

#### Build and Run the App
```bash
npm run build
```
```bash
npm run start
```

Now you can head to `localhost:3000` and start using the app.

### Configuration
The app is configured using the `/Settings` page. You can set the following:
- Supabase URL (Required)
- Supabase Key (Required)
- Edamame App ID
- Edamame App Key


## Roadmap
- [] Finish the baseline functionality
- [] Add a Shopping List
- [] Add Offline Support
- [] Add a Calendar
- [] Add Alerts when low on items
- [] Add Recipe Recommendations
