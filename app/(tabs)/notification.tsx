import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define colors to match the application theme
const colors = {
  background: '#FFD700', // Gold yellow (matching AI page)
  text: '#000000',       // Text is Black for contrast
  border: '#000000',     // Borders are Black
  cardBackground: '#FFFFFF', // Card interiors are White
};

// Define types for our data
interface Alert {
  id: string;
  type: 'announcement' | 'deadline' | 'grade' | 'schedule';
  title: string;
  message: string;
  date: string;
  read: boolean;
  sender: string;
  url?: string; // URL to the full announcement
}

// Define types for university announcements
interface UniversityAnnouncement {
  id: string;
  title: string;
  date: string;
  description: string;
  url: string;
}

const Notifications = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch university announcements on component mount
  useEffect(() => {
    fetchUniversityAnnouncements();
  }, []);

  // Function to fetch announcements from the university website
  const fetchUniversityAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, we would make an API call to fetch the announcements
      // For this demo, we'll use hardcoded data based on the website content
      
      // Since we can't do actual web scraping in the React Native app, 
      // we're simulating the data from the website
      const universitySiteAnnouncements: UniversityAnnouncement[] = [
        {
          id: '1',
          title: 'ABUSpringFest',
          date: '2025-05-13',
          description: 'Değerli Akademisyenlerimiz, İdari Personelimiz ve Sevgili Öğrencilerimiz, Ankara Bilim Üniversitesi olarak bahar şenliğimize davetlisiniz...',
          url: 'https://ankarabilim.edu.tr/duyurular/abuspringfest'
        },
        {
          id: '2',
          title: 'Art Break Corner: Z Kuşağı Nasıl Öğreniyor?',
          date: '2025-05-13',
          description: 'Akademisyenlerimizden ilham alın! 14 Mayıs 2025 Çarşamba günü Prof. Dr. Aydan Öğrenme üzerine bir konuşma yapacaktır.',
          url: 'https://ankarabilim.edu.tr/duyurular/art-break-corner-z-kusagi-nasil-ogreniyor'
        },
        {
          id: '3',
          title: 'Anadolu Ajansı Stajyer Alımı Duyurusu',
          date: '2025-04-17',
          description: 'Değerli Öğrencilerimiz, Anadolu Ajansı, alanında deneyim kazanmak isteyen üniversitemizin 3. ve 4. sınıf öğrencileri için staj imkanı sunmaktadır.',
          url: 'https://ankarabilim.edu.tr/duyurular/anadolu-ajansi-stajyer-alimi-duyurusu'
        },
        {
          id: '4',
          title: 'Hukuk Fakültesi Müfredatı',
          date: '2022-11-30',
          description: 'Hukuk Fakültesi Müfredatı Yayınlandı... Müfredata ulaşmak için websitemizi ziyaret edebilirsiniz.',
          url: 'https://ankarabilim.edu.tr/duyurular/hukuk-fakultesi-mufredati'
        },
        {
          id: '5',
          title: 'Microsoft 365 ve Azure Etkinliği',
          date: '2022-11-28',
          description: 'Ankara Bilim Üniversitesi e-posta hesaplarınız ile, sahip olmuş olduğunuz Microsoft imkanlarını tanıtacağımız etkinliğe davetlisiniz.',
          url: 'https://ankarabilim.edu.tr/duyurular/microsoft-365-ve-azure-etkinligi'
        },
        {
          id: '6',
          title: 'Panel - Yeni Meydan Okumalar-1',
          date: '2022-11-24',
          description: 'Güzel Sanatlar Fakültesi Yeni Medya ve İletişim Bölümü Yeni Meydan Okumalar-1 Yer: Konferans Salonu',
          url: 'https://ankarabilim.edu.tr/duyurular/panel-yeni-meydan-okumalar-1'
        },
        {
          id: '7',
          title: 'Üniversitelerarası Basketbol Erkekler Ligi',
          date: '2022-11-21',
          description: 'Üniversitemiz Erkek Basketbol Takımı "Üniversitelerarası Basketbol Erkekler Liginde A Grubunda" yer almaktadır.',
          url: 'https://ankarabilim.edu.tr/duyurular/universitelerarasi-basketbol-erkekler-ligi'
        }
      ];

      // Convert university announcements to our app's alert format
      const convertedAlerts: Alert[] = universitySiteAnnouncements.map(announcement => ({
        id: announcement.id,
        type: 'announcement',
        title: announcement.title,
        message: announcement.description,
        date: announcement.date,
        read: false,
        sender: 'Ankara Bilim Üniversitesi',
        url: announcement.url
      }));

      setAlerts(convertedAlerts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching university announcements:', err);
      setError('Failed to load announcements. Please try again later.');
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return diffDays + ' days ago';
    } else {
      return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  // Get icon for alert type
  const getAlertIcon = (type: Alert['type']): React.ComponentProps<typeof Ionicons>['name'] => {
    switch(type) {
      case 'announcement':
        return 'megaphone';
      case 'deadline':
        return 'calendar';
      case 'grade':
        return 'school';
      case 'schedule':
        return 'time';
      default:
        return 'notifications';
    }
  };

  // Mark alert as read
  const markAsRead = (id: string): void => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  // Function to open a URL in the browser
  const openUrl = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
    });
  };

  // Render alert item
  const renderAlertItem: ListRenderItem<Alert> = ({ item }) => (
    <TouchableOpacity 
      style={[styles.alertItem, item.read ? styles.readAlert : styles.unreadAlert]}
      onPress={() => {
        markAsRead(item.id);
      }}
    >
      <View style={styles.alertIconContainer}>
        <Ionicons name={getAlertIcon(item.type)} size={24} color="#2196F3" />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertMessage} numberOfLines={2}>{item.message}</Text>
        <View style={styles.alertMeta}>
          <TouchableOpacity onPress={() => openUrl('https://ankarabilim.edu.tr/duyurular')}>
            <View style={styles.senderContainer}>
              <Text style={[styles.alertSender, styles.clickableText]}>{item.sender}</Text>
              <Ionicons name="open-outline" size={14} color="#2196F3" style={styles.linkIcon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.alertDate}>{formatDate(item.date)}</Text>
        </View>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Alerts',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }} />
      
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Loading alerts...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchUniversityAnnouncements}
              >
                <Text style={styles.retryButtonText}>Alerts</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={alerts}
              renderItem={renderAlertItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.alertsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyStateText}>No alerts available</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  alertsList: {
    padding: 10,
  },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  unreadAlert: {
    borderColor: '#2196F3',
    backgroundColor: '#F8F8FF',
  },
  readAlert: {
    borderColor: '#000000',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  alertMessage: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 10,
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertSender: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  alertDate: {
    fontSize: 14,
    color: '#666666',
  },
  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 18,
    color: '#888888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#888888',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clickableText: {
    textDecorationLine: 'underline',
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginLeft: 5,
  },
});

export default Notifications;

