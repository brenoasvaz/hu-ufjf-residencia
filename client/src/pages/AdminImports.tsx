import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, Download, Trash2, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminImports() {
  const [uploading, setUploading] = useState(false);

  const utils = trpc.useUtils();
  const { data: imports, isLoading } = trpc.imports.list.useQuery();

  const deleteMutation = trpc.imports.delete.useMutation({
    onSuccess: () => {
      toast.success("Importação removida com sucesso");
      utils.imports.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao remover importação: ${error.message}`);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, tipo: "RODIZIO" | "CRONOGRAMA") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    setUploading(true);

    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(",")[1];
        if (!base64) {
          toast.error("Erro ao ler arquivo");
          setUploading(false);
          return;
        }

        try {
          // TODO: Implementar upload via tRPC
          toast.info("Funcionalidade de upload será implementada em breve");
          setUploading(false);
        } catch (error) {
          toast.error("Erro ao fazer upload do arquivo");
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
      setUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta importação?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDENTE: { variant: "secondary", label: "Pendente" },
      PROCESSANDO: { variant: "default", label: "Processando" },
      CONCLUIDO: { variant: "outline", label: "Concluído" },
      ERRO: { variant: "destructive", label: "Erro" },
    };

    const config = variants[status] || variants.PENDENTE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Importações de PDFs
        </h1>
        <p className="text-muted-foreground mt-1">
          Importe cronogramas e escalas a partir de arquivos PDF
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Funcionalidade em Desenvolvimento</AlertTitle>
        <AlertDescription>
          O sistema de importação de PDFs está sendo implementado. Em breve você poderá fazer upload de
          arquivos PDF e o sistema extrairá automaticamente os dados de rodízios e atividades.
        </AlertDescription>
      </Alert>

      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Importar Rodízios</CardTitle>
            <CardDescription>
              Faça upload de um PDF contendo a escala mensal de rodízios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Arraste um arquivo PDF ou clique para selecionar
                </p>
                <Button disabled={uploading} asChild>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "RODIZIO")}
                      disabled={uploading}
                    />
                    {uploading ? "Enviando..." : "Selecionar Arquivo"}
                  </label>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importar Cronograma</CardTitle>
            <CardDescription>
              Faça upload de um PDF contendo o cronograma semanal de atividades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Arraste um arquivo PDF ou clique para selecionar
                </p>
                <Button disabled={uploading} asChild>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "CRONOGRAMA")}
                      disabled={uploading}
                    />
                    {uploading ? "Enviando..." : "Selecionar Arquivo"}
                  </label>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Importações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
          <CardDescription>
            {imports?.length || 0} importação(ões) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : imports && imports.length > 0 ? (
            <div className="space-y-3">
              {imports.map((importRecord: any) => (
                <div
                  key={importRecord.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{importRecord.arquivoNome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{importRecord.tipo}</Badge>
                      {getStatusBadge(importRecord.status)}
                      <span>
                        {format(new Date(importRecord.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    {importRecord.logValidacao && (
                      <p className="text-xs text-muted-foreground">{importRecord.logValidacao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Visualizar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Download"
                      onClick={() => window.open(importRecord.arquivoUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(importRecord.id)}
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma importação registrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
