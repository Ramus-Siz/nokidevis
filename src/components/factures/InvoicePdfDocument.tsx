// src/components/invoices/InvoicePdfDocument.tsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer'; // Assurez-vous d'importer Image
import type { Invoice, Client, Material } from '@/types';
import { format } from 'date-fns';



// Les informations de l'entreprise (à terme, viendront d'un store de paramètres)
const companyInfo = {
  name: "Grafiki RDC",
  address: "Bocage 32",
  zipCity: "Kinshasa/RDC",
  phone: "+243 970 361 929",
  email: "contact@grafikirdc.com",
  logoUrl: "/logo.png", 
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40, // Augmenté le padding pour plus d'espace
    fontFamily: 'Helvetica', // Ou 'Roboto' si vous l'avez enregistré
    fontSize: 10,
  },
  // Section en-tête avec logo et date
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  logo: {
    width: 80, // Taille du logo
    height: 80,
    objectFit: 'contain', // Pour s'assurer que le logo s'adapte sans déformation
  },
  dateText: {
    fontSize: 12,
    color: '#555',
  },
  // Bloc d'information de l'entreprise (si utilisé, non affiché par défaut en haut avec logo à gauche)
  companyAddress: {
    marginTop: 10,
    lineHeight: 1.4,
    fontSize: 9,
    textAlign: 'right',
  },
  // Bloc client
  clientInfo: {
    marginBottom: 30,
    borderLeftWidth: 3, // Petite barre de séparation
    borderLeftColor: '#333',
    paddingLeft: 10,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  clientAddress: {
    fontSize: 10,
    marginBottom: 2,
  },
  clientContact: {
    fontSize: 10,
    color: '#555',
  },
  // Titre Facture & Devis
  invoiceDetails: {
    textAlign: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5', // Fond léger pour la section
    borderRadius: 5,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  quotationTotalInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    fontSize: 14,
    color: '#666',
  },
  quotationId: {
    marginRight: 10,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  // Tableau des articles
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e9e9e9', // Gris plus clair pour l'en-tête du tableau
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee', // Ligne plus fine pour les séparateurs de lignes
    paddingVertical: 6,
    alignItems: 'center',
  },
  tableColMat: { width: '40%', paddingLeft: 5, textAlign: 'left' },
  tableColQty: { width: '20%', textAlign: 'center' },
  tableColPrice: { width: '20%', textAlign: 'right', paddingRight: 5 },
  tableColTotal: { width: '20%', textAlign: 'right', paddingRight: 5 },
  // Ligne totale
  finalTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 2,
    borderColor: '#333', // Bordure plus épaisse pour le total
    paddingTop: 10,
    marginTop: 20,
  },
  finalTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: 'grey',
  },
});

interface InvoicePdfDocumentProps {
  invoice: Invoice;
  client: Client | undefined;
  materials: Material[]; // Tous les matériaux pour récupérer les noms
}

export const InvoicePdfDocument: React.FC<InvoicePdfDocumentProps> = ({ invoice, client, materials }) => {
  const getMaterialName = (materialId: string) => {
    return materials.find(m => m.id === materialId)?.name || 'Matériaux inconnu';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* EN-TÊTE : Logo et Date */}
        <View style={styles.headerSection}>
          {/* Le composant Image est ici, il doit être importé de '@react-pdf/renderer' */}
          <Image src={companyInfo.logoUrl} style={styles.logo} />
          <View>
            <Text style={styles.dateText}>Date: {format(new Date(invoice.date), 'dd/MM/yyyy')}</Text>
          </View>
        </View>

        {/* SECTION CLIENT */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client ? client.name : 'Client inconnu'}</Text>
          {client && (
            <>
              <Text style={styles.clientAddress}>{client.contact}</Text>
              <Text style={styles.clientContact}>Email: {client.email}</Text>
              <Text style={styles.clientContact}>Tél: {client.phone}</Text>
            </>
          )}
        </View>

        {/* TITRE FACTURE ID & DEVIS ID / MONTANT TOTAL */}
        <View style={styles.invoiceDetails}>
          <Text style={styles.invoiceTitle}>FACTURE ID: {invoice.id}</Text>
          <View style={styles.quotationTotalInfo}>
            <Text style={styles.quotationId}>Devis ID: {invoice.quotation_id}</Text>
            <Text style={styles.totalAmount}>Total: {invoice.total.toFixed(2)} $</Text>
          </View>
        </View>

        {/* TITRE DES ARTICLES */}
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, marginTop: 20 }}>Détails des Articles</Text>

        {/* TABLEAU DES ARTICLES */}
        <View style={styles.table}>
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableColMat}>Matériaux</Text>
            <Text style={styles.tableColQty}>Qté</Text>
            <Text style={styles.tableColPrice}>Prix Unit.</Text>
            <Text style={styles.tableColTotal}>Total Ligne</Text>
          </View>
          {/* Lignes d'articles */}
          {invoice.items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableColMat}>{getMaterialName(item.material_id)}</Text>
              <Text style={styles.tableColQty}>{item.quantity}</Text>
              <Text style={styles.tableColPrice}>{item.price_per_unit.toFixed(2)} $</Text>
              <Text style={styles.tableColTotal}>{(item.quantity * item.price_per_unit).toFixed(2)} $</Text>
            </View>
          ))}
        </View>

        {/* TOTAL FINAL */}
        <View style={styles.finalTotalContainer}>
          <Text style={styles.finalTotalText}>TOTAL GÉNÉRAL: {invoice.total.toFixed(2)} $</Text>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          {companyInfo.name} - {companyInfo.address}, {companyInfo.zipCity} - Tél: {companyInfo.phone} - Email: {companyInfo.email}
        </Text>
      </Page>
    </Document>
  );
};