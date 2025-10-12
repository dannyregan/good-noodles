// // app/(tabs)/_layout.tsx
// import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs'
// import { Ionicons } from '@expo/vector-icons'

// export default function TabsLayout() {
//     console.log("Rendering Tabs Layout")    
//   return (
//     <NativeTabs>
//       {/* Account/Profile Tab */}
//      <NativeTabs.Trigger name="feed">
//         <Icon sf="gear" />
//         <Label>Feed</Label>
//       </NativeTabs.Trigger>
//       {/* Home Tab */}
//       <NativeTabs.Trigger name="account">
//         <Ionicons name="person-sharp" size={20} color="black" />
//         <Icon sf="house.fill" />
//         <Label>Account</Label>
//       </NativeTabs.Trigger>
//     </NativeTabs> 
//   )
// }


import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="createPost"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-sharp" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
