import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
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
}

// Mock data for alerts/notifications
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'announcement',
    title: 'Campus Event',
    message: 'Join us for the Annual Spring Festival this weekend!',
    date: '2023-05-15T10:00:00',
    read: false,
    sender: 'Student Affairs Office'
  },
  {
    id: '2',
    type: 'deadline',
    title: 'Assignment Due',
    message: 'Your CS101 project is due tomorrow at 11:59 PM.',
    date: '2023-05-14T15:30:00',
    read: true,
    sender: 'Prof. Johnson'
  },
  {
    id: '3',
    type: 'grade',
    title: 'New Grade Posted',
    message: 'Your MATH201 midterm grade has been posted.',
    date: '2023-05-12T09:15:00',
    read: false,
    sender: 'Registrar Office'
  },
  {
    id: '4',
    type: 'schedule',
    title: 'Class Cancelled',
    message: 'ENG301 class on Monday has been cancelled due to instructor illness.',
    date: '2023-05-11T12:45:00',
    read: true,
    sender: 'Engineering Department'
  },
  {
    id: '5',
    type: 'announcement',
    title: 'Library Hours Extended',
    message: 'The main library will be open 24/7 during finals week.',
    date: '2023-05-10T08:30:00',
    read: false,
    sender: 'University Library'
  },
  {
    id: '6',
    type: 'deadline',
    title: 'Registration Deadline',
    message: 'Course registration for Fall semester closes this Friday.',
    date: '2023-05-08T16:20:00',
    read: true,
    sender: 'Academic Affairs'
  },
  {
    id: '7',
    type: 'grade',
    title: 'Final Grades Updated',
    message: 'Final grades for the Spring semester have been posted to your account.',
    date: '2023-05-07T10:10:00',
    read: false,
    sender: 'Registrar Office'
  }
];

const Notifications = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return diffDays + ' days ago';
    } else {
      return date.toLocaleDateString();
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

  // Render alert item
  const renderAlertItem: ListRenderItem<Alert> = ({ item }) => (
    <TouchableOpacity 
      style={[styles.alertItem, item.read ? styles.readAlert : styles.unreadAlert]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.alertIconContainer}>
        <Ionicons name={getAlertIcon(item.type)} size={24} color="#2196F3" />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertMessage}>{item.message}</Text>
        <View style={styles.alertMeta}>
          <Text style={styles.alertSender}>{item.sender}</Text>
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
          <FlatList
            data={alerts}
            renderItem={renderAlertItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.alertsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off" size={48} color="#CCCCCC" />
                <Text style={styles.emptyStateText}>No alerts at this time</Text>
              </View>
            }
          />
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
    alignItems: 'center',
  },
  alertSender: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  alertDate: {
    fontSize: 12,
    color: '#888888',
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 18,
    color: '#888888',
  }
});

export default Notifications;

