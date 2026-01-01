import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-googlecallback',
  templateUrl: './googlecallback.component.html',
  styleUrls: ['./googlecallback.component.css']
})
export class GooglecallbackComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const name = params['name'];
      const role = params['role'];

      if (token && name && role) {
        this.authService.saveAuthData({ token, name, role });
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
