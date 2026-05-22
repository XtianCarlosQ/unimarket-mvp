const UM_DATA = {
  currentUser: {
    id: "u1",
    name: "Valeria Gómez",
    faculty: "Estudiante de Administración - UNMSM",
    email: "valeria.gomez@unmsm.edu.pe",
    avatar: "assets/avatars/valeria.png",
    verified: true,
    rating: 4.9,
    sales: 18,
    purchases: 23,
    favorites: 12
  },
  categories: [
    { id:"accesorios", name:"Accesorios", icon:"💍", count:156 },
    { id:"mascotas", name:"Mascotas", icon:"🐾", count:32 },
    { id:"postres", name:"Postres", icon:"🧁", count:94 },
    { id:"ropa", name:"Ropa", icon:"👕", count:120 },
    { id:"peluches", name:"Peluches", icon:"🧸", count:75 },
    { id:"tejidos", name:"Tejidos", icon:"🧶", count:87 },
    { id:"libros", name:"Libros", icon:"📚", count:64 },
    { id:"tecnologia", name:"Tecnología", icon:"💻", count:52 },
    { id:"hogar", name:"Hogar", icon:"🏠", count:43 },
    { id:"comida", name:"Comida", icon:"🍱", count:118 }
  ],
  sellers: [
    { id:"s1", name:"Tejido Amor", faculty:"Facultad de Letras", avatar:"assets/avatars/tejido.png", rating:4.93, verified:true, sales:46 },
    { id:"s2", name:"Dulce Universitario", faculty:"Facultad de Medicina", avatar:"assets/avatars/dulce.png", rating:4.88, verified:true, sales:51 },
    { id:"s3", name:"Fashion UNI", faculty:"Facultad de Ciencias Económicas", avatar:"assets/avatars/fashion.png", rating:4.72, verified:true, sales:29 },
    { id:"s4", name:"Librería Base", faculty:"Facultad de Derecho", avatar:"assets/avatars/books.svg", rating:4.81, verified:true, sales:38 },
    { id:"s5", name:"Tecno Sanmarquino", faculty:"Facultad de Ingeniería", avatar:"assets/avatars/tech.svg", rating:4.67, verified:true, sales:21 }
  ],
  products: [
    { id:"p1", category:"tejidos", sellerId:"s1", name:"Cangrejo tejido 🦀", price:25, image:"assets/products/crab.png", badge:"Más pedido", description:"Cangrejo tejido a mano con hilo de algodón, ideal para regalo o decoración. Acabado suave, color rosa pastel y entrega coordinada dentro del campus.", place:"Biblioteca Central", schedule:"Lun-Mie-Vie, 1:00 p. m. a 4:30 p. m.", popularity:4.9 },
    { id:"p2", category:"accesorios", sellerId:"s1", name:"Pulsera de perlas", price:15, image:"assets/products/bracelet.png", badge:"Nuevo", description:"Pulsera artesanal con perlas sintéticas y broche ajustable. Diseño discreto para uso diario o regalo universitario.", place:"Puerta 3", schedule:"Mar-Jue, 10:00 a. m. a 2:00 p. m.", popularity:4.7 },
    { id:"p3", category:"accesorios", sellerId:"s3", name:"Collar espejos", price:18, image:"assets/products/necklace.svg", badge:"Tendencia", description:"Collar fino con dije brillante. Ligero, elegante y recomendado para regalos rápidos entre clases.", place:"Facultad de Letras", schedule:"Lunes a viernes, 12:00 m. a 3:00 p. m.", popularity:4.8 },
    { id:"p4", category:"accesorios", sellerId:"s3", name:"Aretes flor", price:12, image:"assets/products/earrings.png", badge:"Oferta", description:"Aretes livianos con diseño floral. Incluye empaque básico y entrega coordinada en zonas académicas.", place:"Comedor Universitario", schedule:"Lun-Mie, 2:00 p. m. a 5:00 p. m.", popularity:4.5 },
    { id:"p5", category:"postres", sellerId:"s2", name:"Postre del día", price:8, image:"assets/products/snack.png", badge:"Dulce", description:"Postre casero del día en presentación individual. Consulta sabor disponible por chat antes de coordinar la entrega.", place:"Facultad de Medicina", schedule:"Todos los días, 11:00 a. m. a 1:00 p. m.", popularity:4.9 },
    { id:"p6", category:"comida", sellerId:"s2", name:"Menú express", price:11, image:"assets/products/lunch.png", badge:"Rápido", description:"Menú universitario por pedido. Ideal para estudiantes con poco tiempo entre clases.", place:"Comedor Universitario", schedule:"Lun-Vie, 12:00 m. a 2:30 p. m.", popularity:4.6 },
    { id:"p7", category:"ropa", sellerId:"s3", name:"Polera UNMSM", price:38, image:"assets/products/hoodie.svg", badge:"Stock limitado", description:"Polera cómoda con estilo universitario. Tallas S, M y L disponibles en colores básicos.", place:"Explanada central", schedule:"Viernes, 3:00 p. m. a 5:30 p. m.", popularity:4.7 },
    { id:"p8", category:"libros", sellerId:"s4", name:"Libro usado", price:22, image:"assets/products/book.svg", badge:"Buen estado", description:"Libro académico usado, conservado y útil para cursos generales. Revisar edición por chat antes de comprar.", place:"Facultad de Derecho", schedule:"Mar-Jue, 9:00 a. m. a 12:00 m.", popularity:4.8 },
    { id:"p9", category:"tecnologia", sellerId:"s5", name:"Calculadora científica", price:35, image:"assets/products/calculator.svg", badge:"Verificado", description:"Calculadora funcional para cursos de matemática, física y estadística. Incluye prueba rápida antes de entrega.", place:"Facultad de Ingeniería", schedule:"Lun-Vie, 4:00 p. m. a 6:00 p. m.", popularity:4.6 },
    { id:"p10", category:"libros", sellerId:"s4", name:"Apuntes del ciclo", price:10, image:"assets/products/notes.svg", badge:"Digital", description:"Resumen organizado de cursos generales. Entrega digital o impresa según disponibilidad.", place:"Biblioteca Central", schedule:"Coordinar por chat", popularity:4.4 },
    { id:"p11", category:"tejidos", sellerId:"s1", name:"Ramito crochet", price:28, image:"assets/products/flower.svg", badge:"Regalo", description:"Ramito tejido a mano, ideal para cumpleaños o detalles rápidos dentro de la universidad.", place:"Puerta principal", schedule:"Sábados, 10:00 a. m. a 12:00 m.", popularity:4.9 },
    { id:"p12", category:"accesorios", sellerId:"s3", name:"Stickers UNMSM", price:6, image:"assets/products/stickers.svg", badge:"Popular", description:"Stickers decorativos con estética universitaria para laptop, cuadernos o botellas.", place:"Explanada central", schedule:"Lun-Vie, 11:00 a. m. a 3:00 p. m.", popularity:4.5 }
  ],
  chats: [
    { id:"c1", sellerId:"s1", productId:"p1", unread:true, time:"10:30", last:"Hola, está disponible 😊", messages:[
      {from:"them", text:"Hola, ¿te interesa el cangrejo tejido?", time:"10:24"},
      {from:"me", text:"Sí, quiero saber si lo puedes entregar hoy.", time:"10:27"},
      {from:"them", text:"Claro, puedo entregarlo en Biblioteca Central a la 1:30 p. m.", time:"10:30"}
    ]},
    { id:"c2", sellerId:"s2", productId:"p5", unread:false, time:"Ayer", last:"Muchas gracias por comprar 💜", messages:[
      {from:"them", text:"Hoy tengo vainilla y chocolate.", time:"12:01"},
      {from:"me", text:"Uno de chocolate, por favor.", time:"12:03"},
      {from:"them", text:"Listo, te espero cerca al comedor.", time:"12:05"}
    ]},
    { id:"c3", sellerId:"s3", productId:"p7", unread:false, time:"Ayer", last:"¿Cuál talla deseas?", messages:[
      {from:"them", text:"Tengo S, M y L disponibles.", time:"16:40"},
      {from:"me", text:"¿La talla M es amplia?", time:"16:44"},
      {from:"them", text:"Sí, te puedo enviar medidas aproximadas.", time:"16:45"}
    ]},
    { id:"c4", sellerId:"s4", productId:"p8", unread:false, time:"2 días", last:"Te envío fotos del estado del libro.", messages:[
      {from:"me", text:"¿El libro tiene subrayados?", time:"09:12"},
      {from:"them", text:"Tiene pocos subrayados, pero está completo.", time:"09:16"}
    ]},
    { id:"c5", sellerId:"s5", productId:"p9", unread:false, time:"3 días", last:"La calculadora está operativa.", messages:[
      {from:"them", text:"Puedes probarla antes de pagar.", time:"15:20"},
      {from:"me", text:"Perfecto, coordinamos en ingeniería.", time:"15:25"}
    ]}
  ]
};
