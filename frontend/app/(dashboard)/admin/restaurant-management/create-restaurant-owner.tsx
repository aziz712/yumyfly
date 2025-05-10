"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAdminStore from "@/store/useAdminStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";

interface CreateRestaurantOwnerProps {
  onSuccess?: () => void;
}

export function CreateRestaurantOwner({
  onSuccess,
}: CreateRestaurantOwnerProps) {
  const { createRestaurantOwner, isLoading } = useAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    telephone: "",
    adresse: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageSelection = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData if there's an image to upload
    if (imageFile) {
      const formDataObj = new FormData();
      formDataObj.append("profileImage", imageFile);
      formDataObj.append("nom", formData.nom);
      formDataObj.append("prenom", formData.prenom);
      formDataObj.append("email", formData.email);
      formDataObj.append("motDePasse", formData.motDePasse);
      formDataObj.append("telephone", formData.telephone);
      formDataObj.append("adresse", formData.adresse);
      console.log("formDataObj", formDataObj);
      const success = await createRestaurantOwner(formDataObj);
      if (success && onSuccess) {
        onSuccess();
        // Reset form
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          motDePasse: "",
          telephone: "",
          adresse: "",
        });
        clearImageSelection();
      }
    } else {
      // No image to upload, just submit the text fields
      const success = await createRestaurantOwner(formData);
      if (success && onSuccess) {
        onSuccess();
        // Reset form
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          motDePasse: "",
          telephone: "",
          adresse: "",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center mb-4">
        <div
          className="relative group cursor-pointer"
          onClick={handleImageClick}
        >
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={imagePreview || "/placeholder.svg?height=96&width=96"}
              alt="Profile"
            />
            <AvatarFallback className="text-lg">
              {formData.prenom?.[0]}
              {formData.nom?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imageFile && (
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-600 mr-2">{imageFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer"
              size="sm"
              onClick={clearImageSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <span className="text-xs text-gray-500 mt-2">
          Cliquez pour ajouter une photo de profil
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom de famille</Label>
          <Input
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom de famille"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motDePasse">Mot de passe</Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          value={formData.motDePasse}
          onChange={handleChange}
          placeholder="Mot de passe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Numéro de téléphone</Label>
        <Input
          id="telephone"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
          placeholder="Numéro de téléphone"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse</Label>
        <Input
          id="adresse"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          placeholder="Adresse"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? "Création..." : "Créer un propriétaire de restaurant"}
      </Button>
    </form>
  );
}
