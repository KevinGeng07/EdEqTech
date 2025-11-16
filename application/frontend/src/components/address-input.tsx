// src/components/address-input.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // Assumes you have a debounce hook. If not, see below.

type Props = {
  // We now pass an AutocompletePrediction object, not a PlaceResult
  onPlaceSelect: (
    place: google.maps.places.AutocompletePrediction | null
  ) => void;
};

export default function AddressInput({ onPlaceSelect }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  
  // Refs to store the Google Maps services
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const sessionToken =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Debounce the input value
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Initialize the AutocompleteService and SessionToken when the map library loads
  useEffect(() => {
    if (places) {
      autocompleteService.current = new places.AutocompleteService();
      sessionToken.current = new places.AutocompleteSessionToken();
    }
  }, [places]);

  // Fetch predictions when the debounced input value changes
  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!autocompleteService.current || !sessionToken.current || !input) {
        setSuggestions([]);
        return;
      }

      try {
        const request = {
          input,
          sessionToken: sessionToken.current,
          // You can add more options here, like 'types', 'componentRestrictions'
        };
        const response =
          await autocompleteService.current.getPlacePredictions(request);
        setSuggestions(response.predictions || []);
      } catch (error) {
        console.error("Error fetching place predictions:", error);
        setSuggestions([]);
      }
    },
    [] // No dependencies, as it relies on refs
  );

  useEffect(() => {
    fetchPredictions(debouncedInputValue);
  }, [debouncedInputValue, fetchPredictions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSuggestionClick = (
    suggestion: google.maps.places.AutocompletePrediction
  ) => {
    // Set the input text to the selected suggestion
    setInputValue('');
    // Clear the suggestions list
    setSuggestions([]);
    // Pass the selected place (which includes the place_id) to the parent
    onPlaceSelect(suggestion);

    // Create a new session token for the next set of searches
    if (places) {
      sessionToken.current = new places.AutocompleteSessionToken();
      
    }
  };

  const clearInput = () => {
    setInputValue("");
    setSuggestions([]);
    onPlaceSelect(null);
  };

  return (
    <div className="relative w-full">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Type an address..."
        className="w-full pl-10 text-base"
        aria-label="Address input with autocomplete"
      />

      {/* Render our own suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          <ul className="py-1">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-muted"
              >
                <div className="mr-3 text-muted-foreground">
                  {/* Here's your custom MapPin icon! */}
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-sm">
                  {suggestion.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}