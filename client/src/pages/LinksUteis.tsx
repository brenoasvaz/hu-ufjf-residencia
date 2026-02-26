import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link as LinkIcon, ExternalLink } from "lucide-react";

export default function LinksUteis() {
  const { data: links, isLoading } = trpc.links.list.useQuery();

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Links Úteis</h1>
        <p className="text-muted-foreground">
          Recursos e ferramentas importantes para os residentes
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando links...</p>
        </div>
      ) : !links || links.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Nenhum link disponível</p>
                <p className="text-sm text-muted-foreground">
                  Os links úteis aparecerão aqui quando forem adicionados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  {link.titulo}
                </CardTitle>
                {link.descricao && (
                  <CardDescription>{link.descricao}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
                >
                  Acessar link
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
