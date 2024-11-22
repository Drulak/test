import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Calendar, Users, User, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const CrecheApp = () => {
  // Schéma de validation pour le formulaire d'ajout d'enfant
  const enfantSchema = z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    dateNaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)"),
    groupe: z.enum(["Bébés", "Moyens", "Grands"]),
    allergies: z.string().optional(),
    parentNom: z.string().min(2, "Le nom du parent doit contenir au moins 2 caractères"),
    parentTelephone: z.string().regex(/^0[1-9]\d{8}$/, "Numéro de téléphone invalide"),
    parentEmail: z.string().email("Email invalide")
  });

  // Données d'exemple
  const [enfants, setEnfants] = useState([
    {
      id: 1,
      nom: "Martin",
      prenom: "Sophie",
      dateNaissance: "2022-03-15",
      age: "2 ans",
      groupe: "Moyens",
      allergies: ["Arachides"],
      parents: {
        nom: "Martin",
        telephone: "06.12.34.56.78",
        email: "parent@email.com"
      },
      presence: true
    },
    {
      id: 2,
      nom: "Dubois",
      prenom: "Lucas",
      dateNaissance: "2023-01-10",
      age: "1 an",
      groupe: "Bébés",
      allergies: [],
      parents: {
        nom: "Dubois",
        telephone: "06.98.76.54.32",
        email: "dubois@email.com"
      },
      presence: false
    }
  ]);

  // Calcul de l'âge
  const calculateAge = (dateNaissance) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  // Données pour les graphiques
  const statsGroupe = [
    { name: "Bébés", value: enfants.filter(e => e.groupe === "Bébés").length },
    { name: "Moyens", value: enfants.filter(e => e.groupe === "Moyens").length },
    { name: "Grands", value: enfants.filter(e => e.groupe === "Grands").length }
  ];

  const presenceData = [
    { jour: "Lundi", presents: enfants.filter(e => e.presence).length },
    { jour: "Mardi", presents: Math.floor(enfants.length * 0.8) },
    { jour: "Mercredi", presents: Math.floor(enfants.length * 0.7) },
    { jour: "Jeudi", presents: Math.floor(enfants.length * 0.9) },
    { jour: "Vendredi", presents: Math.floor(enfants.length * 0.75) }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Hook form pour le formulaire
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(enfantSchema)
  });

  // Fonction d'ajout d'enfant
  const onSubmit = (data) => {
    const nouvelEnfant = {
      id: enfants.length + 1,
      nom: data.nom,
      prenom: data.prenom,
      dateNaissance: data.dateNaissance,
      age: calculateAge(data.dateNaissance),
      groupe: data.groupe,
      allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()) : [],
      parents: {
        nom: data.parentNom,
        telephone: data.parentTelephone,
        email: data.parentEmail
      },
      presence: false
    };

    setEnfants([...enfants, nouvelEnfant]);
    reset(); // Réinitialiser le formulaire
  };

  // Fonction de suppression d'enfant
  const supprimerEnfant = (idEnfant) => {
    setEnfants(enfants.filter(enfant => enfant.id !== idEnfant));
  };

  const FicheEnfant = ({ enfant }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-bold">{enfant.prenom} {enfant.nom}</h3>
              <p className="text-sm text-gray-500">{enfant.age}</p>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => supprimerEnfant(enfant.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="font-semibold">Groupe:</p>
            <p>{enfant.groupe}</p>
          </div>
          <div>
            <p className="font-semibold">Date de naissance:</p>
            <p>{enfant.dateNaissance}</p>
          </div>
          <div>
            <p className="font-semibold">Allergies:</p>
            <p>{enfant.allergies.length ? enfant.allergies.join(", ") : "Aucune"}</p>
          </div>
          <div>
            <p className="font-semibold">Contact parent:</p>
            <p>{enfant.parents.telephone}</p>
            <p className="text-sm">{enfant.parents.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FormulaireAjoutEnfant = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Ajouter un enfant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel enfant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom</Label>
              <Input {...register("nom")} placeholder="Nom de l'enfant" />
              {errors.nom && <p className="text-red-500 text-sm">{errors.nom.message}</p>}
            </div>
            <div>
              <Label>Prénom</Label>
              <Input {...register("prenom")} placeholder="Prénom de l'enfant" />
              {errors.prenom && <p className="text-red-500 text-sm">{errors.prenom.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de naissance</Label>
              <Input type="date" {...register("dateNaissance")} />
              {errors.dateNaissance && <p className="text-red-500 text-sm">{errors.dateNaissance.message}</p>}
            </div>
            <div>
              <Label>Groupe</Label>
              <Select {...register("groupe")}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un groupe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bébés">Bébés</SelectItem>
                  <SelectItem value="Moyens">Moyens</SelectItem>
                  <SelectItem value="Grands">Grands</SelectItem>
                </SelectContent>
              </Select>
              {errors.groupe && <p className="text-red-500 text-sm">{errors.groupe.message}</p>}
            </div>
          </div>

          <div>
            <Label>Allergies (optionnel, séparées par des virgules)</Label>
            <Input {...register("allergies")} placeholder="Ex: Arachides, Lait" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom du parent</Label>
              <Input {...register("parentNom")} placeholder="Nom du parent" />
              {errors.parentNom && <p className="text-red-500 text-sm">{errors.parentNom.message}</p>}
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input {...register("parentTelephone")} placeholder="Numéro de téléphone" />
              {errors.parentTelephone && <p className="text-red-500 text-sm">{errors.parentTelephone.message}</p>}
            </div>
          </div>

          <div>
            <Label>Email du parent</Label>
            <Input {...register("parentEmail")} placeholder="Email" />
            {errors.parentEmail && <p className="text-red-500 text-sm">{errors.parentEmail.message}</p>}
          </div>

          <Button type="submit">Enregistrer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion de Crèche</h1>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">
            <Calendar className="w-4 h-4 mr-2" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="enfants">
            <Users className="w-4 h-4 mr-2" />
            Liste des enfants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par groupe</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart width={300} height={300}>
                  <Pie
                    data={statsGroupe}
                    cx={150}
                    cy={150}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {statsGroupe.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Présences hebdomadaires</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart width={300} height={300} data={presenceData}>
                  <XAxis dataKey="jour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="presents" fill="#8884d8" />
                </BarChart>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enfants">
          <div className="flex justify-end mb-4">
            <FormulaireAjoutEnfant />
          </div>
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            {enfants.map((enfant) => (
              <FicheEnfant key={enfant.id} enfant={enfant} />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrecheApp;
