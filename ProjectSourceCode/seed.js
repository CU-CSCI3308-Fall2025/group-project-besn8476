/////////////////////////
// Seed file needs to be ran manually whenever the database is wiped
/*
When Docker container is opend and running, run the following command in terminal:
docker exec -it project_web node ProjectSourceCode/seed.js
*/
////////////////////////
// ***** ONLY RUN WHEN DATABASE IS EMPTY ***** //
// ***** WE DO NOT NEED DUPLICATE POSTS ***** //

import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const pgp = pgPromise();
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    };

const db = pgp(dbConfig);

export async function runSeed() {
  try {
    console.log("Starting seed...");

    // categories
    await db.none(`
      INSERT INTO categories (name) VALUES
        ('Electronics'),
        ('Clothing'),
        ('Vehicles'),
        ('Sports'),
        ('Beauty and Health'),
        ('Furniture'),
        ('Books')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✔ Categories seeded");

    const categories = await db.any(`SELECT id, name FROM categories`);


    // users
    const users = await db.any(`
      INSERT INTO users (username, password, email)
      VALUES
        ('user1', 'fakehash', 'user1@colorado.edu'),
        ('user2', 'fakehash', 'user2@colorado.edu'),
        ('user3', 'fakehash', 'user3@colorado.edu'),
        ('user4', 'fakehash', 'user4@colorado.edu'),
        ('user5', 'fakehash', 'user5@colorado.edu')
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username, email;
    `);
    // If conflicts prevented inserts (users already exist), fetch existing users
    const seededUsers = users.length
      ? users
      : await db.any(`SELECT id, username, email FROM users ORDER BY id ASC LIMIT 5;`);

    console.log(`✔ Users seeded/found: ${seededUsers.length}`);

    // Map categories by name for easier lookup
    const categoryMap = {};
    for (const c of categories) {
      categoryMap[c.name] = c.id;
    }


    // posts
    const realPosts = [
        // electronics
        {
          title: "AirPods Pro (2nd Gen)",
          description: "Barely used, perfect condition. Includes all original accessories.",
          category: "Electronics",
          price: 180.00,
          image: "https://m.media-amazon.com/images/I/61sRKTAfrhL._AC_UF894,1000_QL80_.jpg"
        },
        {
          title: "Samsung 27-inch Gaming Monitor",
          description: "144Hz, 1ms response time — great for CS students or gaming setups.",
          category: "Electronics",
          price: 120.00,
          image: "https://m.media-amazon.com/images/I/81cSdJuBbFL.jpg"
        },
        {
          title: "RTX 3060 Graphics Card",
          description: "Runs cool and quiet. Selling because I upgraded my build.",
          category: "Electronics",
          price: 295.00,
          image: "https://m.media-amazon.com/images/I/71hoPufXoDL._AC_UF894,1000_QL80_.jpg"
        },
      
        // clothing
        {
          title: "North Face Puffer Jacket — Size M",
          description: "Warm and lightweight; great for Colorado winters.",
          category: "Clothing",
          price: 70.00,
          image: "https://i.ebayimg.com/images/g/nHkAAOSw731i0JbJ/s-l1200.jpg"
        },
        {
          title: "Nike Dri-Fit Hoodie — Size L",
          description: "Barely worn, no stains or tears.",
          category: "Clothing",
          price: 25.00,
          image: "https://images.media-arocam.com/F5CtmAaFdW7KXCTigs_cPgnQlz0=/fit-in/1000x1000/W28495/BLA/t58TJKAa_BLA.png"
        },
      
        // vehicles
        {
          title: "Trek Mountain Bike AL 3",
          description: "Recently tuned, perfect for campus commuting and Boulder trails.",
          category: "Vehicles",
          price: 300.00,
          image: "https://www.sefiles.net/images/library/zoom/trek-domane-al-3-disc-380927-1.jpg"
        },
        {
          title: "Electric Scooter — 15 Mile Range",
          description: "Foldable, lightweight, and great battery life.",
          category: "Vehicles",
          price: 200.00,
          image: "https://ienyrid.com/cdn/shop/files/iENYRID_es60_dual_motor_2400w_off_road_electric_scooter_7.jpg?v=1758535784"
        },
      
        // sports
        {
          title: "Wilson NCAA Basketball (Official Size)",
          description: "Used twice, still has factory grip.",
          category: "Sports",
          price: 20.00,
          image: "https://i5.walmartimages.com/asr/64d766ac-f94b-40f1-96fa-a7ad60ea1b61.981243901e2d912275f13b9caac22c13.png"
        },
        {
          title: "Snowboard + Bindings Package",
          description: "Great beginner board for local resorts.",
          category: "Sports",
          price: 150.00,
          image: "https://images.evo.com/imgp/250/270333/1173834/rome-artifact-snowboard-crux-snowboard-bindings-.jpg"
        },
      
        // beauty & health
        {
          title: "Revlon One-Step Hair Dryer & Volumizer",
          description: "Works great, just upgraded to a Dyson.",
          category: "Beauty and Health",
          price: 25.00,
          image: "https://m.media-amazon.com/images/I/61aV0Q2CE1L._AC_UF1000,1000_QL80_.jpg"
        },
        {
          title: "Set of 3 Resistance Bands",
          description: "Perfect for dorm room or small-space workouts.",
          category: "Beauty and Health",
          price: 10.00,
          image: "https://cdn-jamjp.nitrocdn.com/OqDSCKDvsaJrTyBViAnshQCMCMVIIyRr/assets/images/optimized/rev-535c37e/4korfitness.com/wp-content/uploads/2021/08/Set-of-2_-Hip-Bands-copy.jpg"
        },
      
        // furniture
        {
          title: "IKEA Desk (White)",
          description: "Minimalist study desk, perfect for school setups.",
          category: "Furniture",
          price: 50.00,
          image: "https://www.ikea.com/us/en/images/products/micke-desk-white__0736018_pe740345_s5.jpg?f=s"
        },
        {
          title: "Memory Foam Office Chair",
          description: "Very comfortable, adjustable back support.",
          category: "Furniture",
          price: 40.00,
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWiX0CCwGl0H9Wj5XvsPM85SNHJyM-V1yYog&s"
        },
      
        // books
        {
          title: "Clean Code — Robert C. Martin",
          description: "Excellent condition, required reading for many CS classes.",
          category: "Books",
          price: 15.00,
          image: "https://m.media-amazon.com/images/I/91cgvWgl-fL._AC_UF1000,1000_QL80_.jpg"
        },
        {
          title: "The Subtle Art of Not Giving a F*ck",
          description: "Light wear, no writing or marks inside.",
          category: "Books",
          price: 10.00,
          image: "https://miro.medium.com/v2/resize:fit:1400/1*qXp9MemqNmYwhoNptxeflg.jpeg"
        }
      ];
      

    // insert posts
    if (!seededUsers.length) {
      throw new Error("No users available to attach posts");
    }

    for (let i = 0; i < realPosts.length; i++) {
      const post = realPosts[i];
      const user = seededUsers[i % seededUsers.length]; // rotate through available users

      await db.none(
        `INSERT INTO posts 
          (user_id, title, description, price, category_id, condition, location, image_url, contact_info)
         VALUES 
          ($1, $2, $3, $4, $5, 'Good', 'CU Boulder', $6, $7)
        `,
        [
          user.id,
          post.title,
          post.description,
          post.price,
          categoryMap[post.category],
          post.image,
          user.email
        ]
      );
      
    }

    console.log("Posts seeded");

    console.log("SEED COMPLETE!");
    process.exit(0);

  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}


runSeed(); // run when file is executed directly
