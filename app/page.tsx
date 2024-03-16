'use client';

import { useCallback, useMemo, useState } from "react";
import Settings from "./Settings";
import { Button, Input, useDisclosure } from "@nextui-org/react";
import { toast } from "sonner";
import Title, { TitleType } from "./Title";
import ModalTitle from "./ModalTitle";

const LIMIT = 6 * 5; // 30

export default function Home() {
  const [term, setTerm] = useState("")
  const [titles, setTitles] = useState<TitleType[]>([])
  const [title, setTitle] = useState<TitleType | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const { isOpen: isOpenTitle, onOpen: onOpenTitle, onOpenChange: onOpenChangeTitle } = useDisclosure();
  const [isRandom, setIsRandom] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const randomTitleName = useMemo(() => {
    return titles[Math.floor(Math.random() * titles.length)]?.name
  }, [titles])

  const getRandomTitles = useCallback(async (offset?: number) => {
    setIsSearching(true)

    try {
      const response = await fetch(`/api/title/random?offset=${offset || 0}&limit=${LIMIT}`)

      if (!response.ok) {
        toast.error("Por favor, click no botão Importar dados")
        return
      }

      const json = await response.json()
      const results = json.results || []

      setHasMore(results.length >= LIMIT)

      if (offset === 0) {
        setTitles(results)
      } else {
        setTitles(old => [...old, ...results])
      }

      setIsRandom(true)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const onSearch = useCallback(async (e?: React.FormEvent<HTMLFormElement>, offset?: number) => {
    e?.preventDefault()
    setIsSearching(true)

    if (!term) {
      getRandomTitles(0);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${term}&offset=${offset || 0}&limit=${LIMIT}`)
      const json = await response.json()

      if (!response.ok) {
        toast.error(json?.message || "Falha na busca de títulos")
      }

      setHasMore(json.results.length >= LIMIT)

      if ((offset || 0) === 0) {
        setTitles(json.results || [])
      } else {
        setTitles(old => [...old, ...json.results])
      }

      setIsRandom(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Falha na busca de títulos")
    } finally {
      setIsSearching(false)
    }
  }, [term, getRandomTitles])

  const loadMore = useCallback(async () => {
    if (isRandom) {
      getRandomTitles(titles.length)
    } else {
      onSearch(undefined, titles.length)
    }
  }, [isRandom, getRandomTitles, titles, onSearch])

  const onClickTitle = useCallback((title: TitleType) => {
    setTitle(title)
    onOpenTitle()
  }, [onOpenTitle])

  return (
    <main className="flex min-h-screen flex-col items-center p-3 pt-16 md:p-24">
      <Settings onSuccessImport={getRandomTitles} />
      <h1 className="text-3xl font-bold text-center">
        Title Downloader
      </h1>
      <p className="mt-4 text-center">
        Use esta ferramenta para pesquisar e baixar filmes e séries com o transmission. {!titles.length && "Clique no botão Importar dados para começar"}
      </p>

      <form className="w-full flex gap-3 items-center justify-center mt-4 flex-col md:flex-row" onSubmit={onSearch}>
        <Input
          type="text"
          label="Séries, filmes, gêneros..."
          placeholder={`Ex: ${titles.length ? randomTitleName : "..."}`}
          size="sm"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
          }}
        />
        <Button type="submit" className="w-full md:w-auto" isLoading={isSearching}>
          {term.length ? "Buscar" : "Aleatório"}
        </Button>
      </form>

      {(!titles.length && !isSearching) && <p className="text-center mt-10">Nenhum título encontrado</p>}

      <div className="w-full mt-10 gap-8 grid grid-cols-2 md:grid-cols-6">
        {titles.map((title) => (
          <Title
            key={title.id}
            title={title}
            onClick={() => {
              onClickTitle(title)
            }}
          />
        ))}
      </div>

      <div className="w-full mt-10 flex justify-center items-center">
        {hasMore && (
          <Button
            onClick={loadMore}
            isLoading={isSearching}
          >
            Carregar mais
          </Button>
        )}

        {(!hasMore && !!titles.length) && <p className="text-center">Você chegou ao fim!</p>}
      </div>

      <ModalTitle title={title} isOpen={isOpenTitle} onOpenChange={onOpenChangeTitle} />
    </main>
  );
}
