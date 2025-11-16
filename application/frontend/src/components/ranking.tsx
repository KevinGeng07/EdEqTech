"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export type RankedSchool = {
  rank: number;
  name: string;
  similarity: number;
  imageUrl: string;
};

type RankingProps = {
  schools: RankedSchool[];
  queryParams: string;
};

export function Ranking({ schools, queryParams }: RankingProps) {
  const router = useRouter();

  const getBadgeVariant = (rank: number) => {
    if (rank === 1) return "default";
    if (rank === 2) return "secondary";
    return "outline";
  };

  const handleRowClick = (school: RankedSchool) => {
    const params = new URLSearchParams(queryParams);
    params.set("similarity", school.similarity.toString());
    params.set("imageUrl", school.imageUrl);

    router.push(
      `/chat/${encodeURIComponent(school.name)}?${params.toString()}`
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Rankings</CardTitle>
        <CardDescription>
          Based on similarity score from your query. Click a row to learn more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>School Name</TableHead>
              <TableHead className="text-right">Similarity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow
                key={school.rank}
                onClick={() => handleRowClick(school)}
                className="cursor-pointer"
              >
                <TableCell>
                  <Badge
                    variant={getBadgeVariant(school.rank)}
                    className="text-lg"
                  >
                    {school.rank}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell className="text-right font-mono">
                  {(school.similarity * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
