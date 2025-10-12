// app/(tabs)/_layout.tsx
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs'

export default function TabsLayout() {
    console.log("Rendering Tabs Layout")    
  return (
    <NativeTabs>
      {/* Home Tab */}
      <NativeTabs.Trigger name="account">
        <Icon sf="house.fill" />
        <Label>Account</Label>
      </NativeTabs.Trigger>

      {/* Account/Profile Tab */}
     <NativeTabs.Trigger name="feed">
        <Icon sf="gear" />
        <Label>Feed</Label>
      </NativeTabs.Trigger>
    </NativeTabs> 
  )
}
