'use client';
import '../style/Map.css';
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        kakao: any;
    }
}

type MapProps = {
    selectedRegion: string | null;
    selectedPlace: string  | null;
    setSelectedRegion: (region: string | null) => void;
    setSelectedPlace: (place: string | null) => void;
};

export default function Map({ selectedRegion, selectedPlace, setSelectedRegion, setSelectedPlace }: MapProps) {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_KEY;
    const [map, setMap] = useState<any>(null);
    const [placesService, setPlacesService] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const markerRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!apiKey) {
            console.error("Kakao API key is missing.");
            return;
        }

        const scriptId = "kakao-map-script";

        const initializeMap = () => {
            setTimeout(() => {
                if (window.kakao?.maps?.load) {
                    window.kakao.maps.load(() => {
                        loadMap();
                    });
                }
            }, 200); // 딜레이 줘야 모바일에서 DOM 완성됨
        };

        if (document.getElementById(scriptId)) {
            initializeMap();
            return;
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
        script.async = true;
        document.head.appendChild(script);
        script.onload = initializeMap;
    }, [apiKey]);

    const loadMap = () => {
        if (!mapContainerRef.current || !window.kakao?.maps) return;

        const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.978),
            level: 3,
        };
        const newMap = new window.kakao.maps.Map(mapContainerRef.current, options);
        setMap(newMap);
        setPlacesService(new window.kakao.maps.services.Places());
        geocoderRef.current = new window.kakao.maps.services.Geocoder();

        window.kakao.maps.event.addListener(newMap, "click", (mouseEvent: any) => {
            const latlng = mouseEvent.latLng;
            updateMarker(latlng, newMap);
        });

        // 강제 리사이즈 → 모바일 대응
        setTimeout(() => {
            window.kakao.maps.event.trigger(newMap, "resize");
        }, 300);
    };

    const updateMarker = (latlng: any, mapInstance: any) => {
        if (markerRef.current) markerRef.current.setMap(null);

        const newMarker = new window.kakao.maps.Marker({
            position: latlng,
            map: mapInstance,
        });
        markerRef.current = newMarker;
        mapInstance.setCenter(latlng);

        if (geocoderRef.current) {
            geocoderRef.current.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: string) => {
                if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                    const addressInfo = result[0];
                    setSelectedPlace(addressInfo.road_address?.building_name || addressInfo.address?.address_name || "장소명을 찾을 수 없음");
                    setSelectedRegion(`${addressInfo.address?.region_1depth_name || ""} ${addressInfo.address?.region_2depth_name || ""}`);
                } else {
                    setSelectedPlace("장소명을 찾을 수 없음");
                    setSelectedRegion(null);
                }
            });
        }
    };

    const searchPlace = () => {
        if (!placesService || !map) return;

        placesService.keywordSearch(searchQuery, (results: any[], status: string) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const place = results[0];
                const coords = new window.kakao.maps.LatLng(place.y, place.x);
                updateMarker(coords, map);
                setSelectedPlace(place.place_name);
                setSelectedRegion(`${place.address_name}`);
            } else {
                console.warn("장소를 찾을 수 없습니다.");
            }
        });
    };

    return (
        <div className="KakaoMap">
            <div className="KakaoMap-Search">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="도착지 검색"
                />
                <button onClick={searchPlace}>
                    <img src="/images/scope.webp" alt="scope" />
                </button>
            </div>
            <div
                id="map"
                ref={mapContainerRef}
                style={{ width: "100%", height: "320px", borderRadius: "10px" }}
            />
            <div className="selectedRegion">지역: {selectedRegion}</div>
            <div className="selectedPlace">도착지: {selectedPlace}</div>
        </div>
    );
}
