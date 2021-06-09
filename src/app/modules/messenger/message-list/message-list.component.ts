import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {enterAnimations, IMessage, IUser, toPartner} from '@shared/models';
import {MessengerService, UserService} from '@core/_services';
import {DialogService} from '@features/dialog/dialog.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
  animations: enterAnimations
})
export class MessageListComponent implements OnInit {

  messages$!: Observable<IMessage[]>;
  content = '';
  conversationID = '';
  partner!: IUser;
  curUser: IUser = this.userSr.getCurrentUser();
  color = '#3498db';
  emoji = '👍';

  constructor(
    private activatedRoute: ActivatedRoute,
    private messengerSr: MessengerService,
    private userSr: UserService,
    private dialogSr: DialogService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      map(pra => pra.get('ID') as string),
      switchMap(ID => this.messengerSr.getMessageAPI(ID))
    ).subscribe(
      (res: any) => {
        this.messages$ = of(res.messages);
        this.partner = toPartner(res.conversation, this.curUser._id);
      },
      (error: any) => {
        console.log(error);
      }
    );

    // Get Conversation ID
    this.activatedRoute.paramMap.pipe(
      map(pra => pra.get('ID') as string)).subscribe((res: string) => this.conversationID = res);
  }


  /*
    Send Messages
  */
  sendMessage(): void {
    if (!!this.content.trim()) {
      this.messengerSr.sendMessageAPI({ID: this.conversationID, content: this.content}).subscribe(
        res => console.log(res)
      );
      this.content = '';
    }
  }

  /*
    When click Like Button
  */
  sendLike(): void {
    this.messengerSr.sendMessageAPI({ID: this.conversationID, content: this.emoji}).subscribe(
      res => console.log(res)
    );
  }

  /*
    Confirm & delete conversation then navigation
  */
  deleteConversation(): void {
    this.dialogSr.openConfirmDialog(
      'Confirm',
      'Are you sure that delete this conversation?'
    ).afterClosed().subscribe(
      (res: any) => {
        if (res) {
          this.messengerSr.deleteConversation(this.conversationID).subscribe(
            (_: any) => {
              this.router.navigate(['.']).then((__: any) => {
                this.router.navigate(['chat']).then((___: any) => {
                });
              });
            }
          );
        }
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
}
