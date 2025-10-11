import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import { Regulation, Definition, SelectedReferences } from "@/types/references";

// Register fonts
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 25,
    borderBottom: "1pt solid #000000",
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    color: "#666666",
    marginBottom: 4,
  },
  content: {
    flex: 1,
  },
  heading1: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#000000",
  },
  heading2: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    color: "#000000",
  },
  heading3: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
    color: "#000000",
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
    textAlign: "left",
  },
  text: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecoration: "underline",
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
  lineBreak: {
    height: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#666666",
  },
  // Styles untuk halaman definisi
  definitionsPage: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  definitionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000000",
  },
  definitionItem: {
    marginBottom: 15,
    paddingLeft: 10,
  },
  definitionTerm: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000000",
  },
  definitionMeaning: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#333333",
    marginLeft: 5,
  },
  // Styles untuk halaman referensi peraturan
  regulationsPage: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  regulationsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000000",
  },
  referenceItem: {
    marginBottom: 15,
    paddingLeft: 10,
    flexDirection: "row",
  },
  referenceNumber: {
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 8,
    color: "#000000",
    width: 20,
  },
  referenceContent: {
    flex: 1,
  },
  referenceTitle: {
    fontSize: 11,
    fontWeight: "normal",
    marginBottom: 4,
    color: "#000000",
  },
  referenceText: {
    fontSize: 10,
    marginBottom: 3,
    lineHeight: 1.4,
    color: "#333333",
  },
  referenceUrl: {
    fontSize: 11,
    color: "#0066CC",
    textDecoration: "underline",
  },
  noReferences: {
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#CCCCCC",
    marginVertical: 15,
  },
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
  alignment?: "left" | "center" | "right" | "justify";
}

// Helper component untuk text dengan formatting
const PdfTextItemRenderer = ({ item }: { item: PdfTextItem }) => {
  if (item.type === "line-break") {
    return <View style={styles.lineBreak} />;
  }

  const textStyles = [styles.text];

  if (item.bold) textStyles.push(styles.bold as any);
  if (item.italic) textStyles.push(styles.italic as any);
  if (item.underline) textStyles.push(styles.underline as any);

  return <Text style={textStyles}>{item.content}</Text>;
};

// Helper component untuk render konten dengan alignment
const PdfContentRenderer = ({ content }: { content: PdfContentItem[] }) => {
  return (
    <View style={styles.content}>
      {content.map((item, index) => {
        const alignmentStyle = styles.paragraph;

        switch (item.type) {
          case "heading":
            const headingStyle =
              item.level === 1
                ? styles.heading1
                : item.level === 2
                ? styles.heading2
                : styles.heading3;
            return (
              <Text
                key={item.id || `heading-${index}`}
                style={[headingStyle, alignmentStyle]}
              >
                {item.content as string}
              </Text>
            );

          case "paragraph":
            if (Array.isArray(item.content)) {
              return (
                <View
                  key={item.id || `paragraph-${index}`}
                  style={alignmentStyle}
                >
                  <Text style={alignmentStyle}>
                    {item.content.map(
                      (textItem: PdfTextItem, textIndex: number) => {
                        if (textItem.type === "line-break") {
                          return "\n";
                        }

                        let textStyle: any = {};
                        if (textItem.bold)
                          textStyle = { ...textStyle, ...styles.bold };
                        if (textItem.italic)
                          textStyle = { ...textStyle, ...styles.italic };
                        if (textItem.underline)
                          textStyle = { ...textStyle, ...styles.underline };

                        return (
                          <Text
                            key={textItem.id || `text-${textIndex}`}
                            style={textStyle}
                          >
                            {textItem.content}
                          </Text>
                        );
                      }
                    )}
                  </Text>
                </View>
              );
            }
            return (
              <View
                key={item.id || `paragraph-${index}`}
                style={alignmentStyle}
              >
                <Text style={alignmentStyle}>{item.content as string}</Text>
              </View>
            );

          case "list":
            const listStyle = item.ordered ? styles.orderedList : styles.list;
            const listItemStyle = item.ordered
              ? styles.orderedListItem
              : styles.listItem;

            return (
              <View
                key={item.id || `list-${index}`}
                style={[listStyle, alignmentStyle]}
              >
                {item.items?.map((listItem: PdfTextItem, listIndex: number) => (
                  <View
                    key={listItem.id || `list-item-${listIndex}`}
                    style={listItemStyle}
                  >
                    <Text>
                      {item.ordered ? `${listIndex + 1}. ` : "• "}
                      {listItem.content}
                    </Text>
                  </View>
                ))}
              </View>
            );

          case "line-break":
            return (
              <View
                key={item.id || `break-${index}`}
                style={styles.lineBreak}
              />
            );

          default:
            const defaultItem: PdfTextItem = {
              type: "text",
              id: item.id || `default-${index}`,
              content: item.content as string,
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

// Component untuk render definisi (halaman terpisah)
const DefinitionsRenderer = ({
  definitions,
}: {
  definitions: Definition[];
}) => {
  if (definitions.length === 0) {
    return null;
  }

  return (
    <Page size="A4" style={styles.definitionsPage}>
      <Text style={styles.definitionsTitle}>DEFINISI</Text>

      {definitions.map((def, index) => (
        <View key={`def-${def.id}-${index}`} style={styles.definitionItem}>
          <Text style={styles.definitionTerm}>{def.term} : <Text style={styles.definitionMeaning}>{def.meaning}</Text></Text>
        </View>
      ))}

      {/* Footer untuk halaman definisi */}
      <View style={styles.footer}>
        <Text
          style={styles.footerText}
          render={({
            pageNumber,
            totalPages,
          }: {
            pageNumber: number;
            totalPages: number;
          }) => `Halaman ${pageNumber} / ${totalPages}`}
          fixed
        />
      </View>
    </Page>
  );
};

// Component untuk render referensi peraturan (halaman terpisah)
const RegulationsRenderer = ({
  regulations,
}: {
  regulations: Regulation[];
}) => {
  if (regulations.length === 0) {
    return null;
  }

  return (
    <Page size="A4" style={styles.regulationsPage}>
      <Text style={styles.regulationsTitle}>REFERENSI</Text>

      {regulations.map((reg, index) => (
        <View key={`reg-${reg.id}-${index}`} style={styles.referenceItem}>
          <Text style={styles.referenceNumber}>{index + 1}.</Text>
          <View style={styles.referenceContent}>
            <Text style={styles.referenceTitle}>
              {reg.title} No. {reg.number} Tahun {reg.year} tentang {reg.text}{" "}
              {reg.url && (
                <Link src={reg.url} style={styles.referenceUrl}>
                  {`(${reg.url})`}
                </Link>
              )}
            </Text>
          </View>
        </View>
      ))}

      {/* Footer untuk halaman referensi */}
      <View style={styles.footer}>
        <Text
          style={styles.footerText}
          render={({
            pageNumber,
            totalPages,
          }: {
            pageNumber: number;
            totalPages: number;
          }) => `Halaman ${pageNumber} / ${totalPages}`}
          fixed
        />
      </View>
    </Page>
  );
};

// Custom Footer component untuk halaman konten
const Footer = () => (
  <Text
    style={styles.footerText}
    render={({
      pageNumber,
      totalPages,
    }: {
      pageNumber: number;
      totalPages: number;
    }) => `Halaman ${pageNumber} / ${totalPages}`}
    fixed
  />
);

// Main PDF Document component
export const MyDocument = ({
  content,
  references,
}: {
  content: PdfContentItem[];
  references: SelectedReferences;
}) => (
  <Document>
    {/* Halaman Konten Utama */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>DRAFT DOKUMEN REGULASI</Text>
        <Text style={styles.subtitle}>
          Generated on {new Date().toLocaleDateString("id-ID")}
        </Text>
      </View>

      <PdfContentRenderer content={content} />

      <View style={styles.footer}>
        <Footer />
      </View>
    </Page>

    {/* Halaman DEFINISI (hanya jika ada definisi yang dipilih) */}
    <DefinitionsRenderer definitions={references.definitions} />

    {/* Halaman REFERENSI PERATURAN (hanya jika ada peraturan yang dipilih) */}
    <RegulationsRenderer regulations={references.regulations} />
  </Document>
);
