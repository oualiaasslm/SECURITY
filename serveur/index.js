const sequelize = require('./db');
const User = require('./models/User');
const Post = require('./models/Post');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base MySQL réussie.');

    // Synchroniser les modèles avec la base (crée les tables)
    await sequelize.sync({ force: true }); // force:true recrée la base à chaque fois (à éviter en prod)

    // Création d’un utilisateur et d’un post lié
    const user = await User.create({ name: 'Ouali', email: 'ouali@example.com' });
    const post = await Post.create({ title: 'Mon premier post', content: 'Contenu...', userId: user.id });

    // Récupérer les posts d’un utilisateur
    const posts = await user.getPosts();
    console.log(posts);

  } catch (error) {
    console.error('Erreur :', error);
  }
}

main();
