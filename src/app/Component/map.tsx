'use client';
import '../style/Map.css';
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        kakao: any;
    }
}

export default function ReactKakaoMap() {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_KEY;
    const [map, setMap] = useState<any>(null);
    const [placesService, setPlacesService] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const markerRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);

    useEffect(() => {
        if (!apiKey) {
            console.error("Kakao API key is missing.");
            return;
        }

        const scriptId = "kakao-map-script";
        if (document.getElementById(scriptId)) {
            loadMap();
            return;
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.async = true;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                loadMap();
            });
        };
    }, [apiKey]);

    const loadMap = () => {
        if (!window.kakao) {
            // console.error("Kakao Maps failed to load.");
            return;
        }

        const container = document.getElementById("map");
        if (!container) {
            // console.error("Map container not found.");
            return;
        }

        const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 기본 좌표
            level: 3,
        };
        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);
        setPlacesService(new window.kakao.maps.services.Places());
        geocoderRef.current = new window.kakao.maps.services.Geocoder();

        window.kakao.maps.event.addListener(newMap, "click", (mouseEvent: any) => {
            const latlng = mouseEvent.latLng;
            updateMarker(latlng, newMap);
        });
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
                // console.error("장소를 찾을 수 없습니다.");
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
            <div id="map"/>
            <div className="selectedRegion">
                지역: {selectedRegion}
            </div>
            <div className="selectedPlace">
                도착지: {selectedPlace}
            </div>
        </div>
    );
};
