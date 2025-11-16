import GeoLocator from '@/components/geolocator';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <GeoLocator />
    </main>
  );
}
