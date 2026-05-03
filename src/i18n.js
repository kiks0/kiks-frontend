import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "collections": "COLLECTIONS",
        "blog": "BLOG",
        "contact": "CONTACT US",
        "login": "LOGIN",
        "register": "REGISTER",
        "admin": "ADMIN",
        "profile": "PROFILE",
        "wishlist": "WISHLIST",
        "vault_empty": "No items found"
      },
      "common": {
        "scroll": "Scroll"
      },
      "footer": {
        "explore": "EXPLORE KIKS.COM",
        "services": "ONLINE SERVICES",
        "boutique": "BOUTIQUE SERVICES",
        "house": "THE HOUSE OF KIKS",
        "detect": "Change location and language",
        "high_contrast": "Enable high contrast",
        "validate": "Validate",
        "modal": {
          "title": "You are visiting the Kiks {{location}} website",
          "desc": "Location selection allows KIKS to deliver to you the best services with respect to your localisation.",
          "change": "Change your location"
        },
        "links": {
          "discover": "Discover the Collections",
          "new": "New Arrivals",
          "payment": "Payment Methods",
          "shipping": "Shipping Options",
          "account": "My Account",
          "returns": "Returns",
          "care": "Care & Services",
          "faq": "FAQ",
          "find": "Find a Boutique",
          "book": "Book an appointment",
          "careers": "Careers",
          "legal": "Legal Statement",
          "privacy": "Privacy Policy",
          "report": "Report to Society",
          "fighting": "Fighting Counterfeits",
          "sustainability": "Sustainability-Linked Bond Update",
          "perfumery": "Responsible Perfumery Statement"
        }
      },
      "home": {
        "hero_subtitle": "Experience the essence of elegance like never before.",
        "discover": "Discover More",
        "elite_title": "The Premium Collection",
        "elite_desc": "A golden embrace of warmth and sensuality, where rich resinous amber melts.",
        "discover_btn": "Discover",
        "timeless_trail": "Leaving a long-lasting, luxury scent",
        "fragrance_rich": "A fragrance that feels rich",
        "elixir_bottle": "Elixir in the bottle",
        "potion_enchantment": "A potion of pure enchantment.",
        "into_ocean": "Into the ocean",
        "call_deep": "The call of the deep blue.",
        "teal_glass": "Encased in cool teal glass",
        "art_creation": "The Art of Fragrance",
        "symphony_notes": "A Symphony of Rare Notes.",
        "creation_desc": "Distilled from the most precious ingredients on earth, every KIKS Ultra Luxury fragrance is meticulously curated to awaken the senses and capture raw emotion in a crystalline bottle.",
        "campaign_title": "The New Classic.",
        "campaign_season": "Spring / Summer 2026",
        "view_campaign": "View Campaign",
        "la_reina_desc": "A majestic descent into the opulent. The crown jewel of modern femininity.",
        "discover_extrait": "Discover the Extrait",
        "el_rey_desc": "The undisputed monarch of bold, evocative fragrance. Command the room.",
        "exclusive_parfums": "Exclusive Collections",
        "experience_eternal": "Experience the essence",
        "enter_vault": "Shop Collection"
      },
        "collection": {
        "not_found": "Collection Not Found",
        "mastery": "Quality in every note",
        "open_vault": "Explore Collection",
        "anthology": "Collection List",
        "view_composition": "View Details"
      },
      "product": {
        "masterpiece": "Premium Fragrance",
        "not_found": "Product Not Found",
        "back_to": "Back to",
        "acquire": "Buy Now",
        "dispatch": "Express Delivery",
        "arrive_by": "Expected Delivery by",
        "info": "Product Information",
        "description": "Description",
        "additional": "Additional Information",
        "concentration": "Concentration",
        "volume": "Volume",
        "notes": {
          "top": "Top Notes",
          "heart": "Heart Notes",
          "base": "Base Notes"
        },
        "care": "Designed and crafted using high-quality ingredients from Grasse, France. Store your bottle in a cool, dark place away from direct sunlight to keep the fragrance fresh for a long time.",
        "reviews": "Reviews",
        "share_critique": "Add a Review",
        "rating": "Rating:",
        "headline": "Review headline",
        "experience_placeholder": "Write your review here...",
        "log_critique": "Submit Review",
        "vault_empty": "There are no reviews for this product yet.",
        "verified": "Verified Purchase",
        "restricted": "Only registered users can submit reviews."
      },
      "cart": {
        "your_bag": "Your Bag",
        "empty": "Your bag is empty",
        "start": "Start Exploring",
        "subtotal": "Subtotal",
        "checkout": "Checkout",
        "continue": "Continue Shopping",
        "free_shipping": "Free shipping on all orders"
      }
    }
  },
  hi: {
    translation: {
      "nav": { "collections": "संग्रह", "blog": "ब्लॉग", "contact": "संपर्क", "login": "लॉगइन", "register": "पंजीकरण", "admin": "एडमिन", "profile": "प्रोफ़ाइल", "wishlist": "विशलिस्ट", "vault_empty": "वॉल्ट खाली है" },
      "common": { "scroll": "स्क्रॉल" },
      "footer": { 
        "explore": "अन्वेषण", "services": "सेवाएं", "boutique": "बुटिक", "house": "KIKS हाउस", "detect": "स्थान बदलें", "high_contrast": "कंट्रास्ट", "validate": "पुष्टि",
        "modal": { "title": "आप Kiks {{location}} वेबसाइट देख रहे हैं", "desc": "स्थान चयन KIKS को आपकी स्थानीयता के संबंध में आपको सर्वोत्तम सेवाएँ प्रदान करने की अनुमति देता है।", "change": "अपना स्थान बदलें" },
        "links": { "discover": "संग्रह खोजें", "new": "नया आगमन", "payment": "भुगतान के तरीके", "shipping": "शिपिंग विकल्प", "account": "मेरा खाता", "returns": "प्रतिफल", "care": "देखभाल और सेवाएँ", "faq": "सामान्य प्रश्न", "find": "एक बुटीक खोजें", "book": "एक नियुक्ति बुक करें", "careers": "करियर", "legal": "कानूनी बयान", "privacy": "गोपनीयता नीति", "report": "सोसाइटी को रिपोर्ट", "fighting": "जालसाजी से लड़ना", "sustainability": "सस्टेनेबिलिटी-लिंक्ड बॉन्ड अपडेट", "perfumery": "जिम्मेदार इत्र बयान" }
      },
      "home": { 
        "hero_subtitle": "लालित्य के सार का अनुभव करें।", 
        "discover": "और जानें", 
        "elite_title": "अभिजात वर्ग संग्रह",
        "elite_desc": "गर्मी और कामुकता का सुनहरा आलिंगन।",
        "discover_btn": "खोजें",
        "timeless_trail": "एक कालातीत, शानदार निशान छोड़ना",
        "fragrance_rich": "एक खुशबू जो समृद्ध महसूस होती है",
        "elixir_bottle": "बोतल में अमृत",
        "potion_enchantment": "शुद्ध जादू का एक काढ़ा।",
        "into_ocean": "समुद्र में",
        "call_deep": "गहरे नीले रंग की पुकार।",
        "teal_glass": "ठंडे चैती कांच में बंद",
        "art_creation": "निर्माण की कला",
        "symphony_notes": "दुर्लभ सुरों की एक सिम्फनी।",
        "creation_desc": "पृथ्वी पर सबसे कीमती सामग्रियों से तैयार, हर KIKS खुशबू इंद्रियों को जगाने के लिए बनाई गई है।",
        "exclusive_parfums": "विशेष परफ्यूम",
        "experience_eternal": "शाश्वत सार का अनुभव करें",
        "enter_vault": "तिजोरी में प्रवेश करें"
      },
      "collection": { "not_found": "संग्रह नहीं मिला", "mastery": "हर स्वर में महारत", "open_vault": "तिजोरी खोलें", "view_composition": "रचना देखें" },
      "product": { "masterpiece": "घ्राण उत्कृष्ट कृति", "not_found": "उत्पाद नहीं मिला", "back_to": "वापस", "acquire": "सार प्राप्त करें", "info": "उत्पाद जानकारी", "description": "विवरण", "reviews": "समीक्षाएं" },
      "cart": { "your_bag": "आपका झोला", "empty": "आपका झोला खाली है", "subtotal": "कुल योग", "checkout": "चेकआउट" }
    }
  },
  zh: {
    translation: {
      "nav": { "collections": "系列", "blog": "博客", "contact": "联系我们", "login": "登录", "register": "注册", "admin": "管理员", "profile": "个人资料", "wishlist": "心愿单", "vault_empty": "金库已空" },
      "common": { "scroll": "滚动" },
      "footer": { 
        "explore": "探索 KIKS.COM", "services": "在线服务", "boutique": "精品店服务", "house": "KIKS 之家", "detect": "更改位置和语言", "high_contrast": "开启高对比度", "validate": "验证",
        "modal": { "title": "您正在访问 Kiks {{location}} 网站", "desc": "位置选择允许 KIKS 根据您的本地化为您提供最佳服务。", "change": "更改您的位置" },
        "links": { "discover": "探索系列", "new": "新品上架", "payment": "支付方式", "shipping": "配送选项", "account": "我的账户", "returns": "退货", "care": "保养与服务", "faq": "常见问题", "find": "查找精品店", "book": "预约", "careers": "职业生涯", "legal": "法律声明", "privacy": "隐私政策", "report": "向社会报告", "fighting": "打击假冒", "sustainability": "可持续发展挂钩债券更新", "perfumery": "负责任香氛声明" }
      },
      "home": { 
        "hero_subtitle": "体验前所未有的优雅精华。", 
        "discover": "发现更多", 
        "elite_title": "精英系列",
        "elite_desc": "温暖与感性的金色拥抱。",
        "discover_btn": "发现",
        "timeless_trail": "留下永恒奢华的踪迹",
        "fragrance_rich": "一种感觉丰富的香味",
        "elixir_bottle": "瓶中的长生不老药",
        "potion_enchantment": "纯粹魅惑的药剂。",
        "into_ocean": "进入海洋",
        "call_deep": "深蓝色的召唤。",
        "teal_glass": "装在凉爽的高岭玻璃中",
        "art_creation": "创作艺术",
        "symphony_notes": "稀有音符的交响乐。",
        "creation_desc": "从地球上最珍贵的原料中蒸馏而成，每一款 KIKS 奢华香水都经过精心策划。",
        "exclusive_parfums": "独家香水",
        "experience_eternal": "体验永恒的境界",
        "enter_vault": "进入金库"
      },
      "collection": { "not_found": "未找到系列", "mastery": "每一个音符都精通", "open_vault": "开启金库", "view_composition": "查看构成" },
      "product": { "masterpiece": "嗅觉杰作", "not_found": "产品未找到", "back_to": "返回", "acquire": "获取精华", "info": "产品信息", "description": "描述", "reviews": "评论" },
      "cart": { "your_bag": "您的购物袋", "empty": "您的购物袋是空的", "subtotal": "小计", "checkout": "结账" }
    }
  },
  es: {
    translation: {
      "nav": { "collections": "COLECCIONES", "blog": "BLOG", "contact": "CONTACTO", "login": "INICIAR SESIÓN", "register": "REGISTRARSE", "admin": "ADMIN", "profile": "PERFIL", "wishlist": "DESEOS" },
      "common": { "scroll": "Desplazarse" },
      "footer": { 
        "explore": "EXPLORAR KIKS.COM", "services": "SERVICIOS ONLINE", "boutique": "SERVICIOS BOUTIQUE", "house": "LA CASA KIKS", "detect": "Cambiar ubicación e idioma", "high_contrast": "Contraste alto", "validate": "Validar",
        "modal": { "title": "Estás visitando el sitio web de Kiks {{location}}", "desc": "La selección de ubicación le permite a KIKS brindarle los mejores servicios con respecto a su localización.", "change": "Cambia tu ubicación" },
        "links": { "discover": "Descubre las Colecciones", "new": "Novedades", "payment": "Métodos de Pago", "shipping": "Opciones de Envío", "account": "Mi Cuenta", "returns": "Devoluciones", "care": "Cuidado y Servicios", "faq": "Preguntas Frecuentes", "find": "Buscar una Boutique", "book": "Reservar cita", "careers": "Carreras", "legal": "Declaración Legal", "privacy": "Política de Privacidad", "report": "Informe a la Sociedad", "fighting": "Lucha contra las falsificaciones", "sustainability": "Actualización de bonos vinculados a la sostenibilidad", "perfumery": "Declaración de Perfumería Responsable" }
      },
      "home": { 
        "hero_subtitle": "Experimente la esencia de la elegancia como nunca antes.", 
        "discover": "Descubrir más", 
        "elite_title": "Colección Élite",
        "elite_desc": "Un abrazo dorado de calidez y sensualidad.",
        "discover_btn": "Descubrir",
        "timeless_trail": "Dejando un rastro eterno y lujoso",
        "fragrance_rich": "Una fragancia que se siente rica",
        "elixir_bottle": "Elixir en el frasco",
        "potion_enchantment": "Una poción de puro encantamiento.",
        "into_ocean": "Hacia el océano",
        "call_deep": "La llamada del azul profundo.",
        "teal_glass": "Envuelto en cristal verde azulado",
        "art_creation": "El Arte de la Creación",
        "symphony_notes": "Una sinfonía de notas raras.",
        "creation_desc": "Destilada de los ingredientes más preciosos de la tierra.",
        "exclusive_parfums": "Perfumes Exclusivos",
        "experience_eternal": "Experimenta la esencia eterna",
        "enter_vault": "Entrar en la bóveda"
      },
      "collection": { "not_found": "Colección no encontrada", "mastery": "Maestría en cada nota", "open_vault": "Abrir la bóveda", "view_composition": "Ver Composición" },
      "product": { "masterpiece": "Obra maestra olfativa", "not_found": "Producto no encontrado", "back_to": "Volver a", "acquire": "Adquirir Esencia", "info": "Información del producto", "description": "Descripción", "reviews": "Opiniones" },
      "cart": { "your_bag": "Tu Bolsa", "empty": "Tu bolsa está vacía", "subtotal": "Subtotal", "checkout": "Pagar" }
    }
  },
  de: {
    translation: {
      "nav": { "collections": "KOLLEKTIONEN", "blog": "BLOG", "contact": "KONTAKT", "login": "ANMELDEN", "register": "REGISTRIEREN", "admin": "ADMIN", "profile": "PROFIL", "wishlist": "WUNSCHLISTE" },
      "common": { "scroll": "Scrollen" },
      "footer": { 
        "explore": "KIKS.COM ENTDECKEN", "services": "ONLINE SERVICES", "boutique": "BOUTIQUE SERVICES", "house": "DAS HAUS KIKS", "detect": "Standort und Sprache ändern", "high_contrast": "Hoher Kontrast", "validate": "Bestätigen",
        "modal": { "title": "Sie besuchen die KIKS {{location}} Website", "desc": "Die Standortwahl ermöglicht es KIKS, Ihnen den besten Service in Bezug auf Ihren Standort zu bieten.", "change": "Ändern Sie Ihren Standort" },
        "links": { "discover": "Kollektionen entdecken", "new": "Neuheiten", "payment": "Zahlungsmethoden", "shipping": "Versandoptionen", "account": "Mein Konto", "returns": "Rücksendungen", "care": "Pflege & Services", "faq": "FAQ", "find": "Boutique finden", "book": "Termin buchen", "careers": "Karriere", "legal": "Rechtliche Hinweise", "privacy": "Datenschutz", "report": "Bericht an die Gesellschaft", "fighting": "Kampf gegen Fälschungen", "sustainability": "Sustainability-Linked Bond Update", "perfumery": "Verantwortungsvolle Parfümerie" }
      },
      "home": { 
        "hero_subtitle": "Erleben Sie die Essenz der Eleganz.", 
        "discover": "Mehr entdecken", 
        "elite_title": "Elite-Kollektion",
        "elite_desc": "Eine goldene Umarmung von Wärme und Sinnlichkeit.",
        "discover_btn": "Entdecken",
        "timeless_trail": "Hinterlasse eine zeitlose Spur",
        "fragrance_rich": "Ein Duft, der sich reich anfühlt",
        "elixir_bottle": "Elixier im Flakon",
        "potion_enchantment": "Ein Trank reiner Verzauberung.",
        "into_ocean": "In den Ozean",
        "call_deep": "Der Ruf des tiefen Blaus.",
        "teal_glass": "Eingeschlossen in kühlem Petrolglas",
        "art_creation": "Die Kunst der Schöpfung",
        "symphony_notes": "Eine Symphonie seltener Noten.",
        "creation_desc": "Destilliert aus den kostbarsten Inhaltsstoffen der Erde.",
        "exclusive_parfums": "Exklusive Parfums",
        "experience_eternal": "Erlebe die ewige Essenz",
        "enter_vault": "Betritt das Gewölbe"
      },
      "collection": { "not_found": "Kollektion nicht gefunden", "mastery": "Meisterschaft in jeder Note", "open_vault": "Gewölbe öffnen", "view_composition": "Komposition ansehen" },
      "product": { "masterpiece": "Olfaktorisches Meisterwerk", "not_found": "Produkt nicht gefunden", "back_to": "Zurück zu", "acquire": "Essenz erwerben", "info": "Produktinformationen", "description": "Beschreibung", "reviews": "Bewertungen" },
      "cart": { "your_bag": "Warenkorb", "empty": "Dein Warenkorb ist leer", "subtotal": "Zwischensumme", "checkout": "Zur Kasse" }
    }
  },
  it: {
    translation: {
      "nav": { "collections": "COLLEZIONI", "blog": "BLOG", "contact": "CONTATTI", "login": "ACCEDI", "register": "REGISTRATI", "admin": "ADMIN", "profile": "PROFILO", "wishlist": "WISHLIST" },
      "common": { "scroll": "Scorrere" },
      "footer": { 
        "explore": "SCOPRI KIKS.COM", "services": "SERVIZI ONLINE", "boutique": "SERVIZI BOUTIQUE", "house": "LA MAISON KIKS", "detect": "Cambia località e lingua", "high_contrast": "Alto contrasto", "validate": "Conferma",
        "modal": { "title": "Stai visitando il sito web Kiks {{location}}", "desc": "La scelta della posizione consente a KIKS di fornirti i migliori servizi in base alla tua localizzazione.", "change": "Cambia la tua posizione" },
        "links": { "discover": "Scopri le Collezioni", "new": "Nuovi Arrivi", "payment": "Metodi di Pagamento", "shipping": "Opzioni di Spedizione", "account": "Il mio Account", "returns": "Resi", "care": "Cura e Servizi", "faq": "FAQ", "find": "Trova una Boutique", "book": "Prenota un appuntamento", "careers": "Carriere", "legal": "Note Legali", "privacy": "Privacy Policy", "report": "Rapporto alla Società", "fighting": "Lotta alla contraffazione", "sustainability": "Sustainability-Linked Bond Update", "perfumery": "Dichiarazione Profumeria Responsabile" }
      },
      "home": { 
        "hero_subtitle": "Vivi l'essenza dell'eleganza.", 
        "discover": "Scopri di più", 
        "elite_title": "Collezione Elite",
        "elite_desc": "Un abbraccio dorato di calore e sensualità.",
        "discover_btn": "Scopri",
        "timeless_trail": "Lasciando una scia intramontabile",
        "fragrance_rich": "Una fragranza che si sente ricca",
        "elixir_bottle": "Elisir nel flacone",
        "potion_enchantment": "Una pozione di puro incanto.",
        "into_ocean": "Nell'oceano",
        "call_deep": "Il richiamo del blu profondo.",
        "teal_glass": "Incastonata in vetro verde alzavola",
        "art_creation": "L'Arte della Creazione",
        "symphony_notes": "Una Sinfonia di Note Rare.",
        "creation_desc": "Distillato dagli ingredienti più preziosi della terra.",
        "exclusive_parfums": "Parfums Exclusifs",
        "experience_eternal": "Vivi l'essenza eterna",
        "enter_vault": "Entra nel caveau"
      },
      "collection": { "not_found": "Collezione non trovata", "mastery": "Maestria in ogni nota", "open_vault": "Apri il caveau", "view_composition": "Vedi Composizione" },
      "product": { "masterpiece": "Capolavoro olfattivo", "not_found": "Prodotto non trovato", "back_to": "Torna a", "acquire": "Acquista Essenza", "info": "Informazioni prodotto", "description": "Descrizione", "reviews": "Recensioni" },
      "cart": { "your_bag": "Il tuo Sacco", "empty": "Il tuo sacco è vuoto", "subtotal": "Subtotale", "checkout": "Acquista" }
    }
  },
  ru: {
    translation: {
      "nav": { "collections": "КОЛЛЕКЦИИ", "blog": "БЛОГ", "contact": "КОНТАКТЫ", "login": "ВХОД", "register": "РЕГИСТРАЦИЯ", "admin": "АДМИН", "profile": "ПРОФИЛЬ", "wishlist": "ИЗБРАННОЕ" },
      "common": { "scroll": "Прокрутка" },
      "footer": { 
        "explore": "ИЗУЧИТЬ KIKS.COM", "services": "ОНЛАЙН СЕРВИСЫ", "boutique": "БУТИК СЕРВИСЫ", "house": "ДОМ KIKS", "detect": "Изменить регион и язык", "high_contrast": "Высокий контраст", "validate": "Подтвердить",
        "modal": { "title": "Вы посещаете сайт Kiks {{location}}", "desc": "Выбор местоположения позволяет KIKS предоставлять вам лучшие услуги с учетом вашего региона.", "change": "Измените ваше местоположение" },
        "links": { "discover": "Посмотреть коллекции", "new": "Новинки", "payment": "Способы оплаты", "shipping": "Варианты доставки", "account": "Мой аккаунт", "returns": "Возвраты", "care": "Уход и сервис", "faq": "FAQ", "find": "Найти бутик", "book": "Записаться на прием", "careers": "Карьера", "legal": "Юридическая информация", "privacy": "Политика конфиденциальности", "report": "Отчет обществу", "fighting": "Борьба с подделками", "sustainability": "Sustainability-Linked Bond Update", "perfumery": "Ответственная парфюмерия" }
      },
      "home": { 
        "hero_subtitle": "Почувствуйте эссенцию элегантности.", 
        "discover": "Узнать больше", 
        "elite_title": "Элитная коллекция",
        "elite_desc": "Золотое объятие тепла и чувственности.",
        "discover_btn": "Узнать",
        "timeless_trail": "Оставляя вечный роскошный шлейф",
        "fragrance_rich": "Аромат, который кажется богатым",
        "elixir_bottle": "Эликсир во флаконе",
        "potion_enchantment": "Зелье чистого очарования.",
        "into_ocean": "В океан",
        "call_deep": "Зов глубокой синевы.",
        "teal_glass": "В прохладном тиловом стекле",
        "art_creation": "Искусство творения",
        "symphony_notes": "Симфония редких нот.",
        "creation_desc": "Дистиллировано из самых драгоценных ингредиентов.",
        "exclusive_parfums": "Эксклюзивные парфюмы",
        "experience_eternal": "Почувствуйте вечную сущность",
        "enter_vault": "Войти в хранилище"
      },
      "collection": { "not_found": "Коллекция не найдена", "mastery": "Мастерство в каждой ноте", "open_vault": "Открыть хранилище", "view_composition": "Посмотреть состав" },
      "product": { "masterpiece": "Ольфакторный шедевр", "not_found": "Товар не найден", "back_to": "Назад к", "acquire": "Приобрести эссенцию", "info": "Информация о продукте", "description": "Описание", "reviews": "Отзывы" },
      "cart": { "your_bag": "Ваша сумка", "empty": "Ваша сумка пуста", "subtotal": "Итого", "checkout": "Оформить" }
    }
  },
  ja: {
    translation: {
      "nav": {
        "collections": "コレクション",
        "blog": "ブログ",
        "contact": "お問い合わせ",
        "login": "ログイン",
        "register": "会員登録",
        "admin": "管理",
        "profile": "プロフィール",
        "wishlist": "ウィッシュリスト",
        "vault_empty": "アイテムがありません"
      },
      "common": {
        "scroll": "スクロール"
      },
      "footer": {
        "explore": "KIKS.COMを探索",
        "services": "オンラインサービス",
        "boutique": "ブティックサービス",
        "house": "THE HOUSE OF KIKS",
        "detect": "国と言語を変更",
        "high_contrast": "ハイコントラストを有効にする",
        "validate": "確認",
        "modal": {
          "title": "KIKS {{location}} サイトを訪問中",
          "desc": "場所を選択することで、お客様の地域に最適なサービスを提供いたします。",
          "change": "場所を変更する"
        },
        "links": {
          "discover": "コレクションを見る",
          "new": "新作アイテム",
          "payment": "お支払い方法",
          "shipping": "配送オプション",
          "account": "マイアカウント",
          "returns": "返品",
          "care": "ケア＆サービス",
          "faq": "よくある質問",
          "find": "ブティックを探す",
          "book": "来店予約",
          "careers": "採用情報",
          "legal": "法的通知",
          "privacy": "プライバシーポリシー",
          "report": "社会への報告",
          "fighting": "模倣品への対策",
          "sustainability": "サステナビリティ・リンク・ボンド",
          "perfumery": "責任ある調香声明"
        }
      },
      "home": {
        "hero_subtitle": "かつてないエレガンスの真髄を体験してください。",
        "discover": "詳細を見る",
        "elite_title": "プレミアムコレクション",
        "elite_desc": "芳醇なアンバーが溶け合う、温もりと官能の黄金の抱擁。",
        "discover_btn": "探索する",
        "timeless_trail": "永遠に続くラグジュアリーな余韻",
        "fragrance_rich": "豊かさを感じさせる香り",
        "elixir_bottle": "ボトルの中のエリクサー",
        "potion_enchantment": "純粋な魅惑のポーション。",
        "into_ocean": "深海へ",
        "call_deep": "深い青の呼び声。",
        "teal_glass": "クールなティールガラスに包まれて",
        "art_creation": "調香の芸術",
        "symphony_notes": "希少な香料の交響曲。",
        "creation_desc": "地球上で最も貴重な成分から蒸留されたKIKS Ultra Luxuryのすべての香りは、五感を呼び覚まし、生の感情をクリスタルのボトルに閉じ込めるために細心の注意を払って作られています。",
        "campaign_title": "新たなクラシック。",
        "campaign_season": "2026年 春夏コレクション",
        "view_campaign": "キャンペーンを見る",
        "la_reina_desc": "豪華さへの荘厳な降下。現代の女性らしさの最高傑作。",
        "discover_extrait": "エキストレを探索",
        "el_rey_desc": "大胆で刺激的な香りの絶対的な王者。その場を支配する。",
        "exclusive_parfums": "限定コレクション",
        "experience_eternal": "永遠の真髄を体験",
        "enter_vault": "コレクションを見る"
      },
      "collection": {
        "not_found": "コレクションが見つかりません",
        "mastery": "すべてのノートに宿るクオリティ",
        "open_vault": "コレクションを探索",
        "anthology": "コレクションリスト",
        "view_composition": "詳細を見る"
      },
      "product": {
        "masterpiece": "プレミアムフレグランス",
        "not_found": "製品が見つかりません",
        "back_to": "戻る",
        "acquire": "今すぐ購入",
        "dispatch": "エクスプレス配送",
        "arrive_by": "お届け予定日",
        "info": "製品情報",
        "description": "商品説明",
        "additional": "追加情報",
        "concentration": "濃度",
        "volume": "容量",
        "notes": {
          "top": "トップノート",
          "heart": "ハートノート",
          "base": "ベースノート"
        },
        "care": "フランスのグラースで最高品質の成分を使用して設計・製造されています。香りを長く新鮮に保つため、直射日光を避け、涼しく暗い場所に保管してください。",
        "reviews": "レビュー",
        "share_critique": "レビューを書く",
        "rating": "評価:",
        "headline": "レビューのタイトル",
        "experience_placeholder": "こちらにレビューを記入してください...",
        "log_critique": "レビューを送信",
        "vault_empty": "この製品のレビューはまだありません。",
        "verified": "確認済みの購入者",
        "restricted": "レビューを投稿するにはログインが必要です。"
      },
      "cart": {
        "your_bag": "ショッピングバッグ",
        "empty": "バッグは空です",
        "start": "探索を始める",
        "subtotal": "小計",
        "checkout": "チェックアウト",
        "continue": "お買い物を続ける",
        "free_shipping": "全品送料無料"
      }
    }
  },
  ar: {
    translation: {
      "nav": { "collections": "المجموعات", "blog": "المدونة", "contact": "اتصل بنا", "login": "تسجيل الدخول", "register": "إنشاء حساب", "admin": "المسؤول", "profile": "الملف الشخصي", "wishlist": "قائمة الأمنيات" },
      "footer": { "explore": "استكشف KIKS.COM", "services": "الخدمات عبر الإنترنت", "detect": "تغيير الموقع واللغة", "high_contrast": "تباين عالٍ", "validate": "تأكيد" }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
