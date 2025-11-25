import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"


export function PostCard({
  title,
  description,
  image,
  href,
  category,
  date,
}) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition">
      {image && (
        <div className="relative w-full h-48">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <CardContent className="p-4 space-y-2">
        {category && (
          <Badge variant="outline" className="w-fit">
            {category}
          </Badge>
        )}

        <h3 className="text-xl font-semibold line-clamp-2">{title}</h3>
        <p className="text-muted-foreground line-clamp-3">
          {description}
        </p>

        {date && (
          <p className="text-xs text-muted-foreground">{date}</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={href}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
