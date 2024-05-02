import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const beforeDate = new Date();
    const beforeDateIso = beforeDate.toISOString().split('.')[0] + 'Z';
    const className = context.getClass().name;
    const methodName = context.getHandler().name;

    console.log(`[Request] (${beforeDateIso}) - ${className}: ${methodName}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const afterDate = new Date();
          const afterDateIso = afterDate.toISOString().split('.')[0] + 'Z';
          console.log(
            `[Response] (${afterDateIso}) - ${className}: ${methodName}. Time spent: ${afterDate.getTime() - beforeDate.getTime()}ms`,
          );
        },
        error: (err) => {
          console.log(`Error: ${err.message}`);
          const afterDate = new Date();
          const afterDateIso = afterDate.toISOString().split('.')[0] + 'Z';
          console.log(
            `[Response] (${afterDateIso}) - ${className}: ${methodName}. Time spent: ${afterDate.getTime() - beforeDate.getTime()}ms`,
          );
        },
      }),
    );
  }
}
