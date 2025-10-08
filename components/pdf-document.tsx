import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (optional)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontWeight: 'normal', fontStyle: 'italic' },
  ]
});

// Create styles dengan alignment options
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 25,
    borderBottom: '1pt solid #000000',
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 4,
  },
  content: {
    flex: 1,
  },
  heading1: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#000000',
  },
  heading2: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#000000',
  },
  heading3: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
    color: '#000000',
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
    textAlign: 'left',
  },
  paragraphLeft: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
    textAlign: 'left',
  },
  paragraphCenter: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
    textAlign: 'center',
  },
  paragraphRight: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
    textAlign: 'right',
  },
  paragraphJustify: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecoration: 'underline',
  },
  list: {
    marginLeft: 20,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  orderedList: {
    marginLeft: 20,
    marginBottom: 8,
  },
  orderedListItem: {
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  blockquote: {
    borderLeft: '3pt solid #CCCCCC',
    paddingLeft: 10,
    marginLeft: 10,
    marginBottom: 8,
    fontStyle: 'italic',
    color: '#666666',
  },
  lineBreak: {
    height: 8,
  },
  section: {
    marginBottom: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
  }
});

// Define types untuk content
interface PdfTextItem {
  type: string;
  id: string;
  content?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface PdfContentItem {
  type: string;
  id: string;
  content?: string | PdfTextItem[];
  level?: number;
  ordered?: boolean;
  items?: PdfTextItem[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

// Helper component untuk text dengan formatting
const PdfTextItemRenderer = ({ item }: { item: PdfTextItem }) => {
  if (item.type === 'line-break') {
    return <View style={styles.lineBreak} />;
  }

  const textStyles = [styles.text];
  
  if (item.bold) textStyles.push(styles.bold as any);
  if (item.italic) textStyles.push(styles.italic as any);
  if (item.underline) textStyles.push(styles.underline as any);
  
  return (
    <Text style={textStyles}>
      {item.content}
    </Text>
  );
};

// Helper component untuk render konten dengan alignment
const PdfContentRenderer = ({ content }: { content: PdfContentItem[] }) => {
  return (
    <View style={styles.content}>
      {content.map((item, index) => {
        // Determine alignment style
        const getAlignmentStyle = (alignment?: string) => {
          switch (alignment) {
            case 'center': return styles.paragraphCenter;
            case 'right': return styles.paragraphRight;
            case 'justify': return styles.paragraphJustify;
            default: return styles.paragraphLeft;
          }
        };

        const alignmentStyle = getAlignmentStyle(item.alignment);
        
        switch (item.type) {
          case 'heading':
            const headingStyle = 
              item.level === 1 ? styles.heading1 :
              item.level === 2 ? styles.heading2 : styles.heading3;
            return (
              <Text key={item.id || `heading-${index}`} style={[headingStyle, alignmentStyle]}>
                {item.content as string}
              </Text>
            );
          
          case 'paragraph':
            if (Array.isArray(item.content)) {
              return (
                <View key={item.id || `paragraph-${index}`} style={alignmentStyle}>
                  <Text style={alignmentStyle}>
                    {item.content.map((textItem: PdfTextItem, textIndex: number) => {
                      if (textItem.type === 'line-break') {
                        return '\n';
                      }
                      
                      // Apply formatting
                      let textStyle: any = {};
                      if (textItem.bold) textStyle = { ...textStyle, ...styles.bold };
                      if (textItem.italic) textStyle = { ...textStyle, ...styles.italic };
                      if (textItem.underline) textStyle = { ...textStyle, ...styles.underline };
                      
                      // Handle spasi dan tab khusus
                      let displayContent = textItem.content || '';
                      
                      return (
                        <Text key={textItem.id || `text-${textIndex}`} style={textStyle}>
                          {displayContent}
                        </Text>
                      );
                    })}
                  </Text>
                </View>
              );
            }
            // Jika content adalah string biasa
            return (
              <View key={item.id || `paragraph-${index}`} style={alignmentStyle}>
                <Text style={alignmentStyle}>
                  {item.content as string}
                </Text>
              </View>
            );
          
          case 'text':
            // Convert PdfContentItem to PdfTextItem for renderer
            const textItem: PdfTextItem = {
              type: 'text',
              id: item.id || `text-${index}`,
              content: item.content as string,
              bold: item.bold,
              italic: item.italic,
              underline: item.underline
            };
            return (
              <View key={textItem.id} style={alignmentStyle}>
                <PdfTextItemRenderer item={textItem} />
              </View>
            );
          
          case 'list':
            return (
              <View key={item.id || `list-${index}`} style={[item.ordered ? styles.orderedList : styles.list, alignmentStyle]}>
                {item.items?.map((listItem: PdfTextItem, listIndex: number) => (
                  <View key={listItem.id || `list-item-${listIndex}`} style={item.ordered ? styles.orderedListItem : styles.listItem}>
                    <Text>
                      {item.ordered ? `${listIndex + 1}. ` : '• '}
                      {listItem.content}
                    </Text>
                  </View>
                ))}
              </View>
            );
          
          case 'blockquote':
            return (
              <View key={item.id || `blockquote-${index}`} style={[styles.blockquote, alignmentStyle]}>
                <Text>{item.content as string}</Text>
              </View>
            );
          
          case 'line-break':
            return <View key={item.id || `break-${index}`} style={styles.lineBreak} />;
          
          default:
            const defaultItem: PdfTextItem = {
              type: 'text',
              id: item.id || `default-${index}`,
              content: item.content as string
            };
            return (
              <View key={defaultItem.id} style={alignmentStyle}>
                <PdfTextItemRenderer item={defaultItem} />
              </View>
            );
        }
      })}
    </View>
  );
};

// Custom Footer component
const Footer = () => (
  <Text
    style={styles.footerText}
    render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => 
      `Halaman ${pageNumber} / ${totalPages}`
    }
    fixed
  />
);

// Main PDF Document component
export const MyDocument = ({ content }: { content: PdfContentItem[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DRAFT DOKUMEN REGULASI</Text>
        <Text style={styles.subtitle}>
          Generated on {new Date().toLocaleDateString('id-ID')}
        </Text>
      </View>
      
      {/* Main Content */}
      <PdfContentRenderer content={content} />
      
      {/* Footer */}
      <View style={styles.footer}>
        <Footer />
      </View>
    </Page>
  </Document>
);