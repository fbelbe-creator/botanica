/* ==========================================================================
   Botanica — stylist directory (baseline data)
   --------------------------------------------------------------------------
   This file is the fallback / seed copy of the roster. It loads as a plain
   script so the site still works when opened straight from disk.

   On Netlify the pages fetch the live roster from
   /.netlify/functions/get-stylists, which the admin dashboard writes to.
   If that call fails for any reason, the site falls back to this list, so a
   backend outage can never leave the page empty.

   Roles: hair | colour | extensions | nails
   Days:  [Mon, Tue, Wed, Thu, Fri, Sat]  (true = generally available)
   ========================================================================== */
window.BOTANICA_STYLISTS = [
  {
    "id": "chloe-1",
    "name": "Chloe",
    "title": "Hair Stylist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c277_FF6055E3-5F22-470F-B7EB-457619C429C2.jpg",
    "tel": "0431218103",
    "instagram": "https://www.instagram.com/hairbycloee",
    "booking": "",
    "note": "",
    "bio": "Clo-ee Clarke is a hair stylist known for modern looks inspired by current trends. Experienced in every aspect of the salon — from cut and colour to keratin smoothing treatments — she also loves creating styles for special events and weddings. After 13+ years in hairdressing, she lives to help people look and feel their best.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 1
  },
  {
    "id": "joanna-2",
    "name": "Joanna",
    "title": "Hair Stylist · Colourist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c28e_JP%20-%20Ioanna%20Panou.jpg",
    "tel": "0424201985",
    "instagram": "https://www.instagram.com/joanna_panos",
    "booking": "https://www.fresha.com/book-now/joanna-panos-vthlwy8b/all-offer?pId=728926",
    "note": "",
    "bio": "Joanna brings 20 years of experience gained through work and education in Paris, London, Athens, Melbourne and the Gold Coast. A globally Certified Redken Colourist and Kevin Murphy Session Stylist, her creativity has taken her to Mercedes-Benz Fashion Week and editorial work. In the salon she personalises her craft to enhance every client — and is especially passionate about upstyles, bridal and formal hair.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 2
  },
  {
    "id": "helen-3",
    "name": "Helen",
    "title": "Hair Stylist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2e6_IMG_8599.jpeg",
    "tel": "0403891965",
    "instagram": "",
    "booking": "",
    "note": "",
    "bio": "Helen works across cutting, colour and styling at Botanica. Give her a call to talk through what you are after and book your appointment.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 3
  },
  {
    "id": "armela-4",
    "name": "Armela",
    "title": "Blondes & Extensions",
    "role": "extensions",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2e9_LAC03268.jpeg",
    "tel": "0424380462",
    "instagram": "https://www.instagram.com/armela_libertyhairextensions",
    "booking": "",
    "note": "Currently on maternity leave",
    "bio": "With 16 years of industry expertise, I specialise in blondes, balayage and extensions — always prioritising hair health. Committed to excellence, I use only the finest products to enhance and maintain the beauty of every client’s hair.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 4
  },
  {
    "id": "ali-5",
    "name": "Ali",
    "title": "Hair Stylist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2a7_IMG_7208.jpeg",
    "tel": "0405972240",
    "instagram": "https://www.instagram.com/alifcosta",
    "booking": "",
    "note": "",
    "bio": "Ali offers cutting, colour and styling from her chair at Botanica. Get in touch to find a time that suits you.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 5
  },
  {
    "id": "mia-6",
    "name": "Mia",
    "title": "Hair Stylist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2c4_IMG_1641.jpeg",
    "tel": "0415385079",
    "instagram": "https://www.instagram.com/bohemianhair",
    "booking": "",
    "note": "",
    "bio": "Mia of Bohemian Hair creates relaxed, lived-in looks with a natural, effortless finish. Call or message on Instagram to book.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 6
  },
  {
    "id": "enna-7",
    "name": "Enna",
    "title": "Nail Technician",
    "role": "nails",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2d6_image0.jpeg",
    "tel": "0431890153",
    "instagram": "https://www.instagram.com/enni.gelmani",
    "booking": "https://bookings.gettimely.com/ennigelmanicurist/bb/book",
    "note": "",
    "bio": "Welcome to Enni Gel Manicurist. I specialise in both soft and hard builder gel services, including a detailed e-file manicure. I’m passionate about achieving high-quality luxury results while maintaining the health and integrity of your natural nails. Questions about services or nail art? Reach out on Instagram.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 7
  },
  {
    "id": "amanda-8",
    "name": "Amanda",
    "title": "Holistic Hair & Wellbeing",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2de_FB_IMG_1740979282965.jpg",
    "tel": "0432297722",
    "instagram": "https://www.instagram.com/amandaabsolom",
    "booking": "https://square.link/u/DBhgDRuV",
    "note": "",
    "bio": "With over 40 years in the hair industry, Amanda Absolom blends expertise with a deep passion for natural remedies and sustainable living. At Botanica she embraces The Art of Simplicity, offering organic haircare tailored to individual lifestyles. Her holistic approach goes beyond hair — prioritising scalp health, mindful rituals and the power of nature, from Moringa Tree Scalp Oil to Everscents Natural Shampoo.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 8
  },
  {
    "id": "michelle-9",
    "name": "Michelle",
    "title": "Colourist & Colour Analyst",
    "role": "colour",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2e4_Facetune_17-09-2025-08-51-11.jpeg",
    "tel": "0426503125",
    "instagram": "https://www.instagram.com/kuscocolour",
    "booking": "",
    "note": "",
    "bio": "Hair colour specialist and colour analyst. With decades of experience across hairdressing and fashion, Michelle helps you find the colours that make you glow. Through colour analysis she identifies your perfect shades for clothing, make-up and hair — and as a specialist in natural-looking hair colour, she enhances your unique beauty with tones that suit you effortlessly.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 9
  },
  {
    "id": "jacky-10",
    "name": "Jacky",
    "title": "Hair Stylist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2df_FullSizeRender.jpeg",
    "tel": "0410559463",
    "instagram": "",
    "booking": "",
    "note": "",
    "bio": "Jacky works from her chair at Botanica across cutting, colour and finishing. Call to arrange a time.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 10
  },
  {
    "id": "rod-11",
    "name": "Rod",
    "title": "Hair Stylist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2e1_9fa9b36b-bc25-4eaa-b437-c59f67b7e32e.jpeg",
    "tel": "0411079292",
    "instagram": "",
    "booking": "",
    "note": "",
    "bio": "Rod has over 40 years of experience across every aspect of hair. He can’t wait to welcome you into the new space at Botanica — come and meet The Boys @ Botanica. Call for an appointment.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 11
  },
  {
    "id": "andre-12",
    "name": "Andre",
    "title": "Colour & Smoothing Specialist",
    "role": "colour",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2e2_0240e1f1-4bf3-4969-8db7-6fcf936a729f.jpeg",
    "tel": "0411783066",
    "instagram": "",
    "booking": "",
    "note": "",
    "bio": "Over 35 years of top-quality hair styling and colouring. Andre has exceptional knowledge of all things colour and is an experienced Novak keratin smoothing specialist. He looks forward to seeing existing clients and making new connections.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 12
  },
  {
    "id": "milly-13",
    "name": "Milly",
    "title": "Blondes & Colour Correction",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2e7_IMG_141128_0.jpeg",
    "tel": "0423299905",
    "instagram": "https://www.instagram.com/Her_stylesociety",
    "booking": "",
    "note": "",
    "bio": "Hi, I’m a Gold Coast based hairdresser with a passion for creating beautiful, lived-in blondes and seamless colour corrections. Whether you’re after a bright beachy blonde or a fix-up that brings your hair back to life, I’ve got you covered. Known for my big personality and love of a good chat — think of your appointment as a catch-up with a friend who happens to do your hair.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 13
  },
  {
    "id": "hayley-14",
    "name": "Hayley",
    "title": "Colour & Extensions",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2e5_EB6DBF0C-68B3-4948-9678-096C89C2FB47%20-%20Hayley%20Burns.jpeg",
    "tel": "0499911699",
    "instagram": "https://www.instagram.com/Studioheli__",
    "booking": "",
    "note": "",
    "bio": "With 14 years in the industry, Hayley loves creating customised colour and effortlessly beautiful hair that feels fresh, modern and completely personal. From blondes and balayage to creative colour and Great Lengths keratin bond extensions, she brings a relaxed, tailored approach to every appointment. Working with Evo Hueverse colour, Hayley is all about beautiful results and healthy hair.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 14
  },
  {
    "id": "david-15",
    "name": "David",
    "title": "Cutting Specialist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2e8_78E4C4F1-C2D5-4A0B-9FBA-502F084F40DB.png",
    "tel": "0402107777",
    "instagram": "",
    "booking": "",
    "note": "",
    "bio": "David McCarthy — hair cutting specialist and block colour specialist. Call to book your next appointment.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 15
  },
  {
    "id": "belinda-16",
    "name": "Belinda",
    "title": "Hair Extension Specialist",
    "role": "extensions",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a0fdc797292fe971b23c2ea_IMG_20260403_183346_866%20-%20Belinda%20Angeloska.webp",
    "tel": "0411650431",
    "instagram": "https://www.instagram.com/belhair.extensions",
    "booking": "",
    "note": "",
    "bio": "I’m Bel. Since 2020 I’ve specialised in premium hair extensions, working with tape, slimline weft and keratin bonds. My approach is all about precision, comfort and a seamless blend — creating natural-looking length and volume that fits effortlessly into your everyday look.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 16
  },
  {
    "id": "rachael-17",
    "name": "Rachael",
    "title": "Hair Stylist",
    "role": "hair",
    "img": "https://cdn.prod.website-files.com/6a0fdc797292fe971b23c239/6a3afe9d6b37a88932859844_A3072941-3F98-4064-A80D-C0ED91BD51E0%20-%20Rachael%20Tansley.png",
    "tel": "0432581941",
    "instagram": "https://www.instagram.com/styledbyrachael.gc",
    "booking": "",
    "note": "",
    "bio": "Hi, I’m Rachael. With over 15 years of experience in the hair industry, I’m passionate about creating beautiful, personalised results through colour, cutting, styling and treatments. Known for my warm nature, attention to detail and love of a good chat, I make every appointment feel luxurious — complete with my signature hot towel treatments.",
    "days": [
      false,
      true,
      true,
      true,
      true,
      true
    ],
    "active": true,
    "order": 17
  }
];
