"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/PageTitle";
import { states } from "@/lib/states";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { formatDocument, formatPhoneNumber, isValidDocument } from "@/lib/formValidators";
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const updatePersonSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'E-mail é obrigatório' }),
  birthDate: z.date({
    required_error: "A data é obrigatória",
  }),
  document: z
    .string()
    .min(11, { message: 'CPF é obrigatório' })
    .max(14, { message: 'CPF inválido' })
    .refine((value) => isValidDocument(value.replace(/\D/g, '')), {
      message: 'CPF inválido',
    }),
  phone: z.string().min(10, { message: 'Telefone é obrigatório' }),
  address: z.string().min(1, { message: 'Endereço é obrigatório' }),
  city: z.string().min(1, { message: 'Cidade é obrigatória' }),
  state: z.string().min(1, { message: 'Estado é obrigatório' })
});

type PersonFormData = z.infer<typeof updatePersonSchema>;

export default function PersonEdit({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<PersonFormData>({
    resolver: zodResolver(updatePersonSchema),
    defaultValues: {
      name: '',
      email: '',
      birthDate: undefined,
      document: '',
      phone: '',
      address: '',
      city: '',
      state: '',
    }
  });

  useEffect(() => {
    async function fetchPersonById() {
      try {
        const response = await api.get(`/person/${params.id}`);
        
        console.log(response.data.person.state)

        form.reset({
          name: response.data.person.name,
          email: response.data.person.email,
          birthDate: new Date(response.data.person.dateOfBirth),
          document: response.data.person.cpf,
          phone: response.data.person.phone,
          address: response.data.person.address,
          city: response.data.person.city,
          state: response.data.person.state,
        });
      } catch (error) {
        console.error("Error fetching person:", error);

        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados da pessoa. Tente novamente.",
          variant: "destructive",
        });
      }
    }
    
    fetchPersonById();
  }, [params.id, form, toast]);

  const watchDocument = form.watch('document');

  useEffect(() => {
    if (watchDocument) {
      form.setValue(
        'document',
        formatDocument(watchDocument.replace(/\D/g, '').slice(0, 14)),
      )
    }
  }, [watchDocument, form])

  const onSubmit = async (data: PersonFormData) => {
    try {
      setIsLoading(true);
      
      const formattedData = {
        ...data,
        cpf: data.document,
        phone: data.phone.replace(/\D/g, ''),
        dateOfBirth: format(data.birthDate, "yyyy-MM-dd"),
      };
  
      await api.put(`/person/${params.id}`, formattedData);
  
      toast({
        title: "Sucesso",
        description: "Pessoa atualizada com sucesso!",
      });
  
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error("Error updating person:", error);
      
      const errorMessage = error.response?.data?.message;
  
      if (errorMessage === "E-mail already exists.") {
        form.setError("email", {
          type: "manual",
          message: "Esse e-mail já foi cadastrado"
        });
        
        toast({
          title: "Erro",
          description: "Esse e-mail já foi cadastrado",
          variant: "destructive",
        });
      } 
      else if (errorMessage === "CPF already exists.") {
        form.setError("document", {
          type: "manual",
          message: "Esse CPF já foi cadastrado"
        });
        
        toast({
          title: "Erro",
          description: "Esse CPF já foi cadastrado",
          variant: "destructive",
        });
      }
      else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao atualizar a pessoa. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-6xl">
        <PageTitle title="Editar pessoa" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 p-6 shadow-lg rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Digite seu e-mail" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Nascimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                            field.onChange(formatDocument(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Contato e Endereço</h2>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          {...field}
                          value={formatPhoneNumber(field.value)}
                          onChange={(e) => {
                            const formattedValue = formatPhoneNumber(e.target.value)
                            field.onChange(formattedValue)
                          }}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu endereço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite sua cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(estado => (
                            <SelectItem key={estado.sigla} value={estado.sigla}>
                              {estado.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}