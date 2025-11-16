// src/components/geolocator.tsx
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddressInput from "./address-input";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Loader2, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ranking, type RankedSchool } from "./ranking";

type Position = {
  lat: number;
  lng: number;
};

type ParameterType = "switch" | "number" | "text" | "slider" | "select";

export type ParameterConfig = {
  id: string;
  label: string;
  type: ParameterType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
};

export const ALL_PARAMETERS: ParameterConfig[] = [
  {
    id: "Income Earned from Working 10 Hours a Week at State's Minimum Wage",
    label: "Income Earned from Working 10 Hours a Week at State's Minimum Wage",
    type: "slider",
    min: 0,
    max: 200,
    step: 10,
  },
  {
    id: "Affordability Gap (net price minus income earned working 10 hrs at min wage)",
    label:
      "Affordability Gap (net price minus income earned working 10 hrs at min wage)",
    type: "slider",
    min: -50000,
    max: 100000,
    step: 50,
  },
  {
    id: "Adjusted Monthly Center-Based Child Care Cost",
    label: "Adjusted Monthly Center-Based Child Care Cost",
    type: "slider",
    min: 0,
    max: 5000,
    step: 500,
  },
  {
    id: "Total Enrollment",
    label: "Total Enrollment",
    type: "slider",
    min: 0,
    max: 100000,
    step: 100,
  },
  {
    id: "Transfer Out Rate",
    label: "Transfer Out Rate",
    type: "slider",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    id: "Median Earnings of Students Working and Not Enrolled 10 Years After Entry",
    label:
      "Median Earnings of Students Working and Not Enrolled 10 Years After Entry",
    type: "slider",
    min: 0,
    max: 1000000,
    step: 1000,
  },
  {
    id: "Percent of Undergraduates Age 25 and Older",
    label: "Percent of Undergraduates Age 25 and Older",
    type: "slider",
    min: 0,
    max: 1,
    step: 0.001,
  },
  {
    id: "Average Cost of Attendance",
    label: "Average Cost of Attendance",
    type: "slider",
    min: 0,
    max: 1000000,
    step: 1000,
  },
  {
    id: "Major",
    label: "Major",
    type: "select",
    options: ["STEM", "Arts and Humanities"],
  },
  {
    id: "Race",
    label: "Race",
    type: "select",
    options: [
      "White",
      "American Indian or Alaska Native",
      "Asian",
      "Black or African American",
      "Latino",
      "Native Hawaiian or Other Pacific Islander",
    ],
  },
];

function ZoomToPosition({
  position,
}: {
  position: { lat: number; lng: number } | null;
}) {
  const map = useMap(); // gets the map instance

  useEffect(() => {
    if (map && position) {
      map.panTo(position);
      map.setZoom(15);
    }
  }, [map, position]);

  return null; // this component renders nothing
}

export default function GeoLocator() {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.AutocompletePrediction | null>(null);

  const [activeParameters, setActiveParameters] = useState<string[]>([]);
  const [parameterValues, setParameterValues] = useState<{
    [key: string]: any;
  }>({
    isUrgent: false,
    quantity: 1,
    notes: "",
    priority: 3,
    category: "Residential",
  });
  const [collegeCount, setCollegeCount] = useState(1);
  const [schools, setSchools] = useState<string[]>([]);
  const [similarities, setSimilarities] = useState<number[]>([]);
  const [schoolImageUrls, setSchoolImageUrls] = useState<string[]>([]);
  const [lastQuery, setLastQuery] = useState("");

  // --- THIS IS THE ONLY CHANGE ---
  // The type of 'place' is now AutocompletePrediction
  const handlePlaceSelect = (
    place: google.maps.places.AutocompletePrediction | null
  ) => {
    setSelectedPlace(place);
    if (place) {
      toast({
        title: "Address Selected",
        description: `Selected: ${place.description}`,
      });
    }
  };

  const handleParameterToggle = (paramId: string) => {
    setActiveParameters((prev) =>
      prev.includes(paramId)
        ? prev.filter((p) => p !== paramId)
        : [...prev, paramId]
    );
  };

  const handleConfirm = async () => {
    if (!selectedPlace || !selectedPlace.place_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a valid address first.",
      });
      return;
    }

    setLoading(true);
    setPosition(null);
    setSchools([]);
    setSimilarities([]);
    setSchoolImageUrls([]);

    const payload = ALL_PARAMETERS.reduce(
      (acc, param) => {
        if (activeParameters.includes(param.id)) {
          if (param.type === "text" && parameterValues[param.id] === "") {
            acc[param.id] = "undefined";
          } else {
            acc[param.id] = parameterValues[param.id];
          }
        }
        return acc;
      },
      { place_id: selectedPlace.place_id, k: collegeCount } as {
        [key: string]: any;
      }
    );

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/get_ranking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch coordinates.");
      }

      const data = await response.json();
      setSchools(data.schools || []);
      setSimilarities(data.similarities || []);
      setSchoolImageUrls(data.schoolImageUrls || []);

      const queryPayloadForURL: { [key: string]: any } = {};
      for (const param of ALL_PARAMETERS) {
        if (activeParameters.includes(param.id)) {
          queryPayloadForURL[param.id] = parameterValues[param.id];
        } else {
          if (param.type === "switch") {
            queryPayloadForURL[param.id] = false;
          } else if (param.type === "select") {
            queryPayloadForURL[param.id] = null;
          } else {
            queryPayloadForURL[param.id] = NaN;
          }
        }
      }
      queryPayloadForURL["collegeCount"] = collegeCount;
      setLastQuery(new URLSearchParams(queryPayloadForURL).toString());

      toast({
        title: "Location Confirmed",
        description: `Displaying the ranking for the selected location.`,
      });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      setPosition(null);
    } finally {
      setLoading(false);
    }
  };

  const rankedSchools = useMemo<RankedSchool[]>(() => {
    if (
      !schools ||
      !similarities ||
      schools.length !== similarities.length ||
      schools.length !== schoolImageUrls.length
    ) {
      return [];
    }
    return schools.map((name, index) => ({
      name,
      similarity: similarities[index],
      rank: index + 1,
      imageUrl: schoolImageUrls[index],
    }));
  }, [schools, similarities, schoolImageUrls]);

  // const handlePlaceSelect = async (
  //   place: google.maps.places.AutocompletePrediction | null
  // ) => {
  //   // ------------------------------

  //   if (!place || !place.place_id) {
  //     setPosition(null);
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     // The rest of your logic is perfectly fine, as it only needs the place_id
  //     const response = await fetch("http://localhost:8000/get_place", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         placeId: place.place_id,
  //         isUrgent,
  //         quantity,
  //         notes,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || "Failed to fetch coordinates.");
  //     }

  //     const data = await response.json();
  //     setPosition(data.location);

  //     toast({
  //       title: "Location and Parameters Sent",
  //       description: `Sent: ${place} with your parameters.`,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     const errorMessage =
  //       error instanceof Error ? error.message : "An unknown error occurred.";
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: errorMessage,
  //     });
  //     setPosition(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Configuration Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Google Maps API key is missing. Please add
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
          </p>
        </CardContent>
      </Card>
    );
  }

  // const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City
  const defaultCenter = { lat: 39.8283, lng: -98.5795 };

  const renderParameterInput = (param: ParameterConfig) => {
    switch (param.type) {
      case "switch":
        return (
          <div className="flex items-center justify-between" key={param.id}>
            <Label htmlFor={param.id}>{param.label}</Label>
            <Switch
              id={param.id}
              checked={parameterValues[param.id]}
              onCheckedChange={(val) =>
                setParameterValues((p) => ({ ...p, [param.id]: val }))
              }
            />
          </div>
        );
      case "number":
        return (
          <div className="space-y-2" key={param.id}>
            <Label htmlFor={param.id}>{param.label}</Label>
            <Input
              id={param.id}
              type="number"
              value={parameterValues[param.id]}
              onChange={(e) =>
                setParameterValues((p) => ({
                  ...p,
                  [param.id]: Number(e.target.value),
                }))
              }
              min={param.min}
              className="bg-background"
            />
          </div>
        );
      case "text":
        return (
          <div className="space-y-2" key={param.id}>
            <Label htmlFor={param.id}>{param.label}</Label>
            <Textarea
              id={param.id}
              placeholder={`Add any ${param.label.toLowerCase()} here...`}
              value={parameterValues[param.id]}
              onChange={(e) =>
                setParameterValues((p) => ({
                  ...p,
                  [param.id]: e.target.value,
                }))
              }
              className="bg-background"
            />
          </div>
        );
      case "slider":
        return (
          <div className="space-y-2" key={param.id}>
            <div className="flex justify-between">
              <Label htmlFor={param.id}>{param.label}</Label>
              <span className="text-sm text-muted-foreground">
                {parameterValues[param.id]}
              </span>
            </div>
            <Slider
              id={param.id}
              min={param.min}
              max={param.max}
              step={param.step}
              value={[parameterValues[param.id]]}
              onValueChange={([val]) =>
                setParameterValues((p) => ({ ...p, [param.id]: val }))
              }
            />
          </div>
        );
      case "select":
        return (
          <div className="space-y-2" key={param.id}>
            <Label htmlFor={param.id}>{param.label}</Label>
            <Select
              value={parameterValues[param.id]}
              onValueChange={(val) =>
                setParameterValues((p) => ({ ...p, [param.id]: val }))
              }
            >
              <SelectTrigger id={param.id}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    // Make sure 'places' is in the libraries array
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <Card className="w-full max-w-2xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            EquiMatch
          </CardTitle>
          <CardDescription className="pt-1">
            Enter an address and set your parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <AddressInput onPlaceSelect={handlePlaceSelect} />

            {selectedPlace && (
              <div className="text-center pt-1">
                <p className="text-lg font-semibold text-foreground -mb-2">
                  Location:
                  <span className="ml-2 text-2xl">
                    {selectedPlace.description}
                  </span>
                </p>
              </div>
            )}
            <Card className="p-4 bg-background/50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeCount">Number of Colleges</Label>
                  <Input
                    id="collegeCount"
                    type="number"
                    value={collegeCount}
                    onChange={(e) => {
                      const val = Math.max(
                        1,
                        Math.min(20, Number(e.target.value) || 1)
                      );
                      setCollegeCount(val);
                    }}
                    min={1}
                    max={20}
                    className="bg-background"
                  />
                </div>

                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        Select Parameters ({activeParameters.length} selected)
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                      <DropdownMenuLabel>
                        Available Parameters
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ALL_PARAMETERS.map((param) => (
                        <DropdownMenuCheckboxItem
                          key={param.id}
                          checked={activeParameters.includes(param.id)}
                          onCheckedChange={() =>
                            handleParameterToggle(param.id)
                          }
                          onSelect={(e) => e.preventDefault()} // Prevent menu from closing on item click
                        >
                          {param.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                {ALL_PARAMETERS.filter((param) =>
                  activeParameters.includes(param.id)
                ).map(renderParameterInput)}
              </div>
            </Card>

            <Button
              onClick={handleConfirm}
              disabled={loading || !selectedPlace}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Locating..." : "Confirm & Locate"}
            </Button>
          </div>

          {(loading || position) && (
            <div
              className="h-80 w-full rounded-lg overflow-hidden border bg-muted"
              aria-label="Map displaying location"
            >
              {loading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                position && (
                  <Map
                    mapId="bf51a910020fa25a"
                    defaultCenter={defaultCenter}
                    defaultZoom={4}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    className="h-full w-full"
                  >
                    <ZoomToPosition position={position} />

                    <AdvancedMarker position={position}>
                      <MapPin
                        className="h-10 w-10 text-primary drop-shadow-lg"
                        fill="hsl(var(--primary))"
                      />
                    </AdvancedMarker>
                  </Map>
                )
              )}
            </div>
          )}

          {!loading && rankedSchools.length > 0 && (
            <Ranking schools={rankedSchools} queryParams={lastQuery} />
          )}
        </CardContent>
      </Card>
    </APIProvider>
  );
}
