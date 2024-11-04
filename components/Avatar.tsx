import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Image, Button } from 'react-native' 
import * as ImagePicker from 'expo-image-picker'

// References:
// 1. This code references concepts and patterns demonstrated in Supabase's tutorial 
// on React Native Database & User Authentication available on their YouTube channel.
// Supabase. "React Native Database & User Authentication." YouTube, https://www.youtube.com/watch?v=AE7dKIKMJy4&list=PL5S4mPUpp4OsrbRTx21k34aACOgpqQGlx

// Define the types for the component's props
interface Props {
  size: number // Size of the avatar image
  url: string | null // URL of the image
  onUpload: (filePath: string) => void // Callback function to handle image upload
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  // State variables for upload status and avatar URL
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Avatar size style based on the provided size prop
  const avatarSize = { height: size, width: size }

  // Fetch the avatar image when the component mounts or when `url` changes
  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  // Function to download an image from Supabase storage
  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) throw error // Throw error if download fails

      const fr = new FileReader() // Create a FileReader to read the file as a data URL
      fr.readAsDataURL(data) // Read the image data as a base64-encoded string
      fr.onload = () => {
        setAvatarUrl(fr.result as string) // Update avatarUrl state with the base64 string
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message) // Log download errors to console
      }
    }
  }

  // Function to handle avatar upload
  async function uploadAvatar() {
    try {
      setUploading(true) // Set uploading state to true to disable button and show loading status

      // Launch the device's image library for the user to pick an image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
        allowsMultipleSelection: false, // Single image selection only
        allowsEditing: true, // Allow user to crop/rotate image before uploading
        quality: 1, // High-quality image
        exif: false, // Do not include EXIF metadata
      })

      // Exit function if the user cancels the picker
      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.')
        return
      }

      const image = result.assets[0] // Retrieve selected image
      console.log('Got image', image)

      // Check if the image URI exists
      if (!image.uri) {
        throw new Error('No image uri!') // Throw error if there's no URI (unlikely but handled for safety)
      }

      // Fetch the image as an array buffer
      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())

      // Extract file extension and define path for upload
      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const path = `${Date.now()}.${fileExt}` // Unique path based on timestamp

      // Upload the array buffer to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg', // Set content type, default to jpeg
        })

      if (uploadError) {
        throw uploadError // Throw error if upload fails
      }

      onUpload(data.path) // Call the onUpload callback with the file path
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message) // Display alert with error message if upload fails
      } else {
        throw error // Throw non-standard errors
      }
    } finally {
      setUploading(false) // Reset uploading state after completion
    }
  }

  return (
    <View>
      {/* Display avatar image if available, otherwise show placeholder */}
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }} // Display the avatar image from URL
          accessibilityLabel="Avatar" // Accessibility label for screen readers
          style={[avatarSize, styles.avatar, styles.image]} // Apply styles for size and appearance
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} /> // Placeholder if no image is available
      )}

      {/* Upload button */}
      <View>
        <Button
          title={uploading ? 'Uploading ...' : 'Upload'} // Display 'Uploading ...' when upload is in progress
          onPress={uploadAvatar} // Trigger upload function on button press
          disabled={uploading} // Disable button while uploading
        />
      </View>
    </View>
  )
}

// Define styles for avatar component
const styles = StyleSheet.create({
  avatar: {
    borderRadius: 5, // Rounded corners
    overflow: 'hidden', // Ensure image fits within rounded corners
    maxWidth: '100%', // Max width to prevent overflow
  },
  image: {
    objectFit: 'cover', // Cover entire area of Image component
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#333', // Dark background color for placeholder
    borderWidth: 1, // Thin border around placeholder
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)', // Light gray border color
    borderRadius: 5, // Rounded corners for placeholder
  },
})
