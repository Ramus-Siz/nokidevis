// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User, UserRole } from '@/types'; // Assurez-vous que l'interface User est correcte
import { readData, writeData } from '@/lib/fileDb'; // Import des fonctions de base de données
import bcrypt from 'bcryptjs'; // Pour le hachage des mots de passe

const usersFileName = 'users.json'; // Nom du fichier JSON des utilisateurs

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe sont requis');
        }

        const users = await readData<User>(usersFileName);
        const user = users.find(u => u.email === credentials.email);

        if (!user || !user.password) { // user.password doit exister pour une comparaison
          throw new Error('Utilisateur non trouvé ou mot de passe non défini');
        }

        // Comparer le mot de passe haché
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Mot de passe incorrect');
        }

        // Si l'authentification réussit, renvoyer l'objet utilisateur (sans le mot de passe)
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours de validité de session
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = (user as User).role; // Assurez-vous que le rôle est bien dans le type User
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.role = token.role as UserRole; // Attribuer le rôle à la session
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin', // Chemin de votre page de connexion
    // signOut: '/auth/signout', // Optionnel, si vous avez une page de déconnexion spécifique
    // error: '/auth/error', // Page d'erreur optionnelle
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };