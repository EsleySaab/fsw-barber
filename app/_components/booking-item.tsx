"use client"

import { Prisma } from "@prisma/client"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "./ui/sheet"
import Image from "next/image"
import PhoneItem from "./phone-item"
import { Button } from "./ui/button"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { deleteBooking } from "../_actions/delete-bookings"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: {
        include: {
          barbershop: true
        }
      }
    }
  }>
}



const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const {
    service: { barbershop },
  } = booking
  const isConfirmed = isFuture(booking.date)
  const handleCancelBooking = async () => {
    try {
      await deleteBooking(booking.id.toString())
      setIsSheetOpen(false)
      toast({
        title: "Cancelar Reserva",
        description: "Reserva cancelada com sucesso!",
      })
    } catch (error) {
      console.log(error)
      toast({
        title: "Erro ao cancelar",
        description: "Erro ao cancelar reserva. Tente Novamente.",
      })
    }
  }

  const bookingWithNumberPrice = {
    ...booking,
    service: {
      ...booking.service,
      price: Number(booking.service.price.toString()), // Converte para number
    },
  }

  

  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen)
  }
  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <div className="min-w-[90%]">
          <Card>
            <CardContent className="flex justify-between p-0">
              {/* ESQUERDA */}
              <div className="flex flex-col gap-2 py-5 pl-5">
                <Badge
                  className="w-fit"
                  variant={isConfirmed ? "default" : "secondary"}
                >
                  {isConfirmed ? "Confirmado" : "Finalizado"}
                </Badge>
                <h3 className="font-semibold">
                  {booking.service.name.toString()}
                </h3>

                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={booking.service.barbershop.imageUrl.toString()}
                    />
                  </Avatar>
                  <p className="text-sm">
                    {booking.service.barbershop.name.toString()}
                  </p>
                </div>
              </div>

              {/* DIREITA */}
              <div className="flex flex-col items-center justify-center border-l-2 px-5">
                <p className="text-sm capitalize">
                  {format(booking.date, "MMMM".toString(), {
                    locale: ptBR,
                  })}
                </p>
                <p className="text-2xl">
                  {format(booking.date, "dd".toString(), {
                    locale: ptBR,
                  })}
                </p>
                <p className="text-sm">
                  {format(booking.date, "HH:mm".toString(), {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetTrigger>
      <SheetContent className="w-[90%]">
        <SheetHeader>
          <SheetTitle className="text-left">Informações da Reserva</SheetTitle>
        </SheetHeader>
        <div className="relative mt-6 flex h-[180px] w-full items-end">
          <Image
            src="/card-mapa.png"
            fill
            className="rounded-xl object-cover"
            alt={`Mapa da barbearia ${booking.service.barbershop.name.toString()}`}
          />

          <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
            <CardContent className="flex items-center gap-3 px-5 py-3">
              <Avatar>
                <AvatarImage src={barbershop.imageUrl.toString()} />
              </Avatar>
              <div>
                <h3 className="font-bold">{barbershop.name.toString()}</h3>
                <p className="text-xs">{barbershop.address.toString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Badge
            className="w-fit"
            variant={isConfirmed ? "default" : "secondary"}
          >
            {isConfirmed ? "Confirmado" : "Finalizado"}
          </Badge>

          <Card className="mb-6 mt-3">
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{booking.service.name.toString()}</h2>
                <p className="text-sm font-bold">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(booking.service.price))}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm text-gray-400">Data</h2>
                <p className="text-sm">
                  {format(booking.date.toString(), "d 'de' MMMM".toString(), {
                    locale: ptBR,
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm text-gray-400">Horário</h2>
                <p className="text-sm">
                  {format(booking.date, "HH:mm".toString())}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-sm text-gray-400">Barbearia</h2>
                <p className="text-sm">{barbershop.name.toString()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {barbershop.phones.map((phone, index) => (
              <PhoneItem key={index} phone={phone} />
            ))}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <div className="flex items-center gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Voltar
              </Button>
            </SheetClose>

            {isConfirmed && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancelar Reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Você deseja cancelar sua reserva?</DialogTitle>
                    <DialogDescription>
                      Ao cancelar, você perderá sua reserva e não poderá
                      recuperá-la. Essa ação é irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">
                        Voltar
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleCancelBooking}
                      >
                        Confirmar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingItem
