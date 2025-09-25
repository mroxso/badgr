import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBadgeDefinition } from '@/hooks/useBadgeActions';
import { useToast } from '@/hooks/useToast';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getTagValue } from '@/lib/badge-utils';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  id: z
    .string()
    .min(3, 'Badge ID must be at least 3 characters')
    .max(64, 'Badge ID must not exceed 64 characters')
    .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, numbers, underscores and hyphens are allowed')
    .refine(value => !value.includes(' '), 'Spaces are not allowed'),
  name: z
    .string()
    .min(2, 'Badge name must be at least 2 characters')
    .max(64, 'Badge name must not exceed 64 characters'),
  description: z
    .string()
    .max(280, 'Description must not exceed 280 characters')
    .optional(),
});

export function BadgeCreationForm() {
  const { toast } = useToast();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutate: createBadge, isPending: isCreating } = useCreateBadgeDefinition();
  const { user } = useCurrentUser();
  const [badgeImage, setBadgeImage] = useState<string | null>(null);
  const [badgeThumbnail, setBadgeThumbnail] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Upload image
      const [[_, imageUrl]] = await uploadFile(file);
      setBadgeImage(imageUrl);
      
      // Use the same image as thumbnail for now
      // In a more complete implementation, you might want to create separate thumbnails
      setBadgeThumbnail(imageUrl);
      
      toast({
        title: "Image uploaded",
        description: "Badge image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to create badges",
        variant: "destructive",
      });
      return;
    }
    
    if (!badgeImage) {
      toast({
        title: "Image required",
        description: "Please upload an image for your badge",
        variant: "destructive",
      });
      return;
    }
    
    createBadge({
      id: values.id,
      name: values.name,
      description: values.description,
      image: badgeImage,
      thumbnail: badgeThumbnail || undefined,
    }, {
      onSuccess: (id) => {
        toast({
          title: "Badge created",
          description: "Your badge was created successfully!",
        });
        
        // Reset form
        form.reset();
        setBadgeImage(null);
        setBadgeThumbnail(null);
      },
      onError: (error) => {
        toast({
          title: "Creation failed",
          description: "Failed to create badge. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Badge</CardTitle>
          <CardDescription>You must be logged in to create badges</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Badge</CardTitle>
        <CardDescription>Design your own badge to award to others</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge ID</FormLabel>
                      <FormControl>
                        <Input placeholder="my-awesome-badge" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for your badge (no spaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Badge" {...field} />
                      </FormControl>
                      <FormDescription>
                        Human-readable name displayed to users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this badge represents"
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Explain what your badge means or how it's earned
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="mb-4 text-center">
                  <p className="text-sm font-medium mb-2">Badge Image</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Square image recommended (1024x1024)
                  </p>
                  
                  <div className="flex justify-center">
                    {badgeImage ? (
                      <Avatar className="w-48 h-48 rounded-lg">
                        <AvatarImage 
                          src={badgeImage} 
                          alt="Badge preview" 
                          className="object-contain"
                        />
                        <AvatarFallback>Badge</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-48 h-48 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground mt-2">
                            Click button below to upload
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('badge-image')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {badgeImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                    <input
                      id="badge-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Button type="submit" disabled={isCreating || isUploading}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Badge
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}