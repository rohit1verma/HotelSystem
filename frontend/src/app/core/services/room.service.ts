import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomResponseDto, RoomSearchDto, AvailableRoomDto } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  // Query and search available rooms based on dates, guests, filters
  searchRooms(dto: RoomSearchDto): Observable<AvailableRoomDto[]> {
    return this.http.post<AvailableRoomDto[]>(`${this.apiUrl}/search`, dto);
  }

  // Retrieve details for a single room
  getRoomById(id: number): Observable<RoomResponseDto> {
    return this.http.get<RoomResponseDto>(`${this.apiUrl}/${id}`);
  }

  // Fetch all rooms (Admin only route from room controller)
  getAllRooms(): Observable<RoomResponseDto[]> {
    return this.http.get<RoomResponseDto[]>(this.apiUrl);
  }
}
