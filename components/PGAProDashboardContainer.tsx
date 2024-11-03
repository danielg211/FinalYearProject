import { createDrawerNavigator } from '@react-navigation/drawer';
import PGAPDashboard from './components/PGADashboard';
import LogLesson from './components/LogLesson'; // This will be your lesson input page

const Drawer = createDrawerNavigator();

export default function PGAProDashboardContainer() {
  return (
    <Drawer.Navigator initialRouteName="Dashboard">
      <Drawer.Screen name="Dashboard" component={PGADashboard} />
      <Drawer.Screen name="Log a Lesson" component={LogLesson} />
    </Drawer.Navigator>
  );
}
