"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import api from "@/lib/axios";
import { z } from 'zod';
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";

const personSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  phone: z.string().regex(/^\d{10,11}$/).optional(),
  address: z.string().optional(),
  city: z.string(),
  state: z.string(),
});

type Person = z.infer<typeof personSchema>;

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [data, setData] = useState<Person[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const perPage = 10;

  async function fetchPeople() {
    try {
      const response = await api.get<{ people: Person[], totalCount: number }>(
        `/person?page=${page}&perPage=${perPage}${searchTerm ? `&search=${searchTerm}` : ''}`
      );
      
      setData(response.data.people);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function handleDeletePerson() {
    if (!selectedPerson) return;

    try {
      await api.delete(`/person/${selectedPerson.id}`);
      
      setDeleteModalOpen(false);
      toast({
        title: "Sucesso",
        description: "Usuário deletado com sucesso!",
      });
      
      await fetchPeople();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar usuário",
        variant: "destructive",
      });
    } 
  }

  function handleEditPerson(person: Person) {
    router.push(`/edit/${person.id}`);
  }

  const columns: ColumnDef<Person>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ getValue }) => {
        const id = getValue() as string;
        const shortId = `${id.slice(0, 4)}...${id.slice(-4)}`;
        return <span>{shortId}</span>;
      },
    },
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      accessorKey: "dateOfBirth",
      header: "Data de Nascimento",
      cell: ({ getValue }) => {
        const dateOfBirth = getValue() as string;
        const formattedDate = dayjs(dateOfBirth).format('DD/MM/YYYY');
  
        return <span>{formattedDate}</span>;
      },
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      cell: ({ getValue }) => {
        const cpf = getValue() as string;
  
        return <span>{cpf}</span>;
      },
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ getValue }) => {
        const phone = getValue() as string | null;
        if (phone) {
          const formattedPhone = `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  
          return <span>{formattedPhone}</span>;
        } else {
          return <span>Não informado</span>;
        }
      },
    },
    {
      accessorKey: "address",
      header: "Endereço",
      cell: ({ getValue }) => {
        const address = getValue() as string | null;
  
        return address ? <span>{address}</span> : <span>Não informado</span>;
      },
    },
    {
      accessorKey: "city",
      header: "Cidade",
    },
    {
      accessorKey: "state",
      header: "Estado",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => handleEditPerson(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => {
              setSelectedPerson(row.original);
              setDeleteModalOpen(true);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchPeople();
  }, [page, searchTerm]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitle title="Pessoas" />
      
      <DataTable
        columns={columns} 
        data={data} 
        totalCount={totalCount}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir <strong>{selectedPerson?.email}</strong>? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePerson}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}