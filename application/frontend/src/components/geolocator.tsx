// src/components/geolocator.tsx
"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dropdown } from "react-day-picker";

type Position = {
  lat: number;
  lng: number;
};

type ParameterType = "switch" | "number" | "text";

type ParameterConfig = {
  id: string;
  label: string;
  type: ParameterType;
};

const ALL_PARAMETERS: ParameterConfig[] = [
  { id: "isUrgent", label: "Urgent", type: "switch" },
  { id: "quantity", label: "Quantity", type: "number" },
  { id: "notes", label: "Notes", type: "text" },
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
  });

  // --- THIS IS THE ONLY CHANGE ---
  // The type of 'place' is now AutocompletePrediction
  const handlePlaceSelect = (
    place: google.maps.places.AutocompletePrediction | null
  ) => {
    setSelectedPlace(place);
    console.log(typeof place);
    console.log(place);
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

    const payload = ALL_PARAMETERS.reduce(
      (acc, param) => {
        if (activeParameters.includes(param.id)) {
          if (param.type === "text" && parameterValues[param.id] === "") {
            acc[param.id] = "undefined";
          } else {
            acc[param.id] = parameterValues[param.id];
          }
        } else {
          acc[param.id] = "undefined";
        }
        return acc;
      },
      { placeId: selectedPlace.place_id } as { [key: string]: any }
    );

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/report`,
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
      setPosition(data.location);
      console.log(data);
      toast({
        title: "Location Confirmed",
        description: `Displaying map for the selected location.`,
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
              min="1"
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
            GeoLocator
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
              <div className="mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Select Parameters({activeParameters.length} selected)
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                    <DropdownMenuLabel>Available Parameters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ALL_PARAMETERS.map((param) => (
                      <DropdownMenuCheckboxItem
                        key={param.id}
                        checked={activeParameters.includes(param.id)}
                        onCheckedChange={() => handleParameterToggle(param.id)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {param.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-4">
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
        </CardContent>
      </Card>
    </APIProvider>
  );
}
